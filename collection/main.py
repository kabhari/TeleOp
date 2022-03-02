import grpc

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc

channel = grpc.insecure_channel("localhost:50051")
stub = coordinate_pb2_grpc.CoordinateStub(channel)
response = stub.SendCoordination(coordinate_pb2.CoordinateRequest(x=1, y=2))
print(response.message)
