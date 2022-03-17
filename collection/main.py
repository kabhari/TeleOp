import grpc

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc


def make_coordinate(x, y):
    return coordinate_pb2.CoordinateRequest(x=x, y=y)


def generate_messages():
    messages = [
        make_coordinate(1, 2),
        make_coordinate(3, 4),
        make_coordinate(5, 6),
        make_coordinate(7, 8),
        make_coordinate(9, 10),
    ]
    for msg in messages:
        print("Sending %s at %s" % (msg.x, msg.y))
        yield msg


def send_message(stub):
    response = stub.SendCoordination(generate_messages())
    print(response)


def run():
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = coordinate_pb2_grpc.CoordinateStub(channel)
        send_message(stub)


run()
