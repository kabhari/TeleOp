import grpc
from concurrent import futures
import logging
import datetime
import os

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc
from google.protobuf.timestamp_pb2 import Timestamp

from dotenv import load_dotenv
load_dotenv()
GRPC_HOST=os.getenv('GRPC_HOST')

class CoordinateServicer(coordinate_pb2_grpc.CoordinateServicer):
    def streamCoordinate(self, request_iterator, context):
        """Recieve the coordinates from the client
        https://grpc.io/docs/languages/python/basics/#request-streaming-rpc

        Args:
            request_iterator (iterator): iterator of msgs coming from the client
            context (object): Not sure why this is needed beyond that it's used in the abstract class

        Returns:
            msg: Proto message returned by the server upon receiving all the coordinates (in case there is a finite number of coordinates)
        """
        timestamp = Timestamp()
        for coordinate in request_iterator:
            sentTime = datetime.datetime.fromtimestamp(
                coordinate.t.seconds + coordinate.t.nanos / 1e9
            )
            timestamp.FromDatetime(datetime.datetime.now())
            receivedTime = datetime.datetime.fromtimestamp(
                timestamp.seconds + timestamp.nanos / 1e9
            )
            log.info(
                f"COORDINATE deltaT: {(receivedTime - sentTime).total_seconds()*1e3} milliseconds"
            )
        return coordinate_pb2.StreamCoordinateResponse(
            message="Server received the coordinate"
        )

class VideoServicer(coordinate_pb2_grpc.VideoServicer):
    def streamVideo(self, request_iterator, context):
        timestamp = Timestamp()
        for video in request_iterator:
            sentTime = datetime.datetime.fromtimestamp(
                video.t.seconds + video.t.nanos / 1e9
            )
            timestamp.FromDatetime(datetime.datetime.now())
            receivedTime = datetime.datetime.fromtimestamp(
                timestamp.seconds + timestamp.nanos / 1e9
            )
            log.info(
                f"VIDEO deltaT: {(receivedTime - sentTime).total_seconds()*1e3} ms"
            )
        return coordinate_pb2.StreamVideoResponse()

def main():
    """Create the server & start"""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    coordinate_pb2_grpc.add_CoordinateServicer_to_server(CoordinateServicer(), server)
    coordinate_pb2_grpc.add_VideoServicer_to_server(VideoServicer(),server)
    server.add_insecure_port(GRPC_HOST)
    server.start()
    log.info(
        "server started, waiting for coordinates to be streamed from the client..."
    )
    server.wait_for_termination()


# setup logging
logging.basicConfig(
    format=" %(asctime)s | %(name)s : %(levelname)s | %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("server")

# execute
main()
