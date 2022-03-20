import grpc
from concurrent import futures
import logging
from datetime import datetime

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc


class CoordinateServicer(coordinate_pb2_grpc.CoordinateServicer):
    def ReceiveCoordination(self, request_iterator, context):
        """Recieve the coordinates from the client
        https://grpc.io/docs/languages/python/basics/#request-streaming-rpc

        Args:
            request_iterator (iterator): iterator of msgs coming from the client
            context (object): Not sure why this is needed beyond that it's used in the abstract class

        Returns:
            msg: Proto message returned by the server upon recieving all the coordinates (in case there is a finite number of coordinates)
        """
        for coordinate in request_iterator:
            log.info(
                f"got coordinates: ({coordinate.x},{coordinate.y}) at \
                {datetime.fromtimestamp(coordinate.t.seconds + coordinate.t.nanos / 1e9)}"
            )
        return coordinate_pb2.CoordinateResponse(
            message="Server recieved the coordinate"
        )


def main():
    """Create the server & start"""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    coordinate_pb2_grpc.add_CoordinateServicer_to_server(CoordinateServicer(), server)
    server.add_insecure_port("[::]:50051")
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
