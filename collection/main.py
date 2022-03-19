from sqlite3 import Time
import grpc

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc
from google.protobuf.timestamp_pb2 import Timestamp

import random
import math
import logging
from datetime import datetime


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


def make_coordinate(x, y, t):
    return coordinate_pb2.CoordinateRequest(x=x, y=y, t=t)


def generate_messages():
    timestamp = Timestamp()
    while True:
        timestamp.FromDatetime(datetime.now())
        msg = make_coordinate(
            random_circle_pnt(10, 0, 0)[0], random_circle_pnt(10, 0, 0)[1], timestamp
        )
        log.info(
            "Sending (%f, %f) at %s"
            % (msg.x, msg.y, datetime.fromtimestamp(msg.t.seconds + msg.t.nanos / 1e9))
        )
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
