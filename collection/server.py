import grpc
from concurrent import futures

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc

import logging
from datetime import datetime


class CoordinateServicer(coordinate_pb2_grpc.CoordinateServicer):
    def SendCoordination(self, request_iterator, context):
        for coordinate in request_iterator:
            log.info(
                "got coordinates: (%f,%f) at %s"
                % (
                    coordinate.x,
                    coordinate.y,
                    datetime.fromtimestamp(
                        coordinate.t.seconds + coordinate.t.nanos / 1e9
                    ),
                )
            )
        return coordinate_pb2.CoordinateResponse(
            message="Client recieved all coordinates"
        )


def main():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    coordinate_pb2_grpc.add_CoordinateServicer_to_server(CoordinateServicer(), server)

    server.add_insecure_port("[::]:50051")
    server.start()
    log.info("server started")
    server.wait_for_termination()


# setup logging
logging.basicConfig(
    format=" %(asctime)s | %(name)s : %(levelname)s | %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("server")
# execute
main()
