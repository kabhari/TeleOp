import grpc
from concurrent import futures

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc


class CoordinateServicer(coordinate_pb2_grpc.CoordinateServicer):
    def SendCoordination(self, request_iterator, context):
        for coordinate in request_iterator:
            print("got coordinates:%f,%f" % (coordinate.x, coordinate.y))
        return coordinate_pb2.CoordinateResponse(
            message="Client recieved all coordinates"
        )


def main():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    coordinate_pb2_grpc.add_CoordinateServicer_to_server(CoordinateServicer(), server)

    server.add_insecure_port("[::]:50051")
    server.start()
    print("server started")
    server.wait_for_termination()


main()
