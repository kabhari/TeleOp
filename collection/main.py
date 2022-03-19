import grpc

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc

import random
import math
import logging


def random_circle_pnt(radius, center_x, center_y):
    # random angle
    alpha = 2 * math.pi * random.random()
    # random radius
    r = radius * math.sqrt(random.random())
    # calculating coordinates
    x = r * math.cos(alpha) + center_x
    y = r * math.sin(alpha) + center_y
    # return
    return x, y


def make_coordinate(x, y):
    return coordinate_pb2.CoordinateRequest(x=x, y=y)


def generate_messages():
    while True:
        msg = make_coordinate(
            random_circle_pnt(10, 0, 0)[0], random_circle_pnt(10, 0, 0)[1]
        )
        log.info("Sending %f at %f" % (msg.x, msg.y))
        yield msg


def send_message(stub):
    response = stub.SendCoordination(generate_messages())
    print(response)


def run():
    with grpc.insecure_channel("localhost:50051") as channel:
        stub = coordinate_pb2_grpc.CoordinateStub(channel)
        send_message(stub)


# setup logging
logging.basicConfig(
    format=" %(asctime)s | %(name)s : %(levelname)s | %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("client")
# execute
run()
