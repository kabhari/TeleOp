import grpc
import random
import math
import logging
import datetime

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc
from google.protobuf.timestamp_pb2 import Timestamp


def generate_random_pnt_circle(radius, center_x, center_y):
    """This function generates a random point inside a circle

    Args:
        radius (int): radius of the circle
        center_x (int): x-coordinate of circle's center point
        center_y (int): y-coordinate of circle's center point

    Returns:
        int, int: a random point inside a circle
    """
    alpha = 2 * math.pi * random.random()  # random angle
    r = radius * math.sqrt(random.random())  # random radius
    # calculate and return coordinates
    return r * math.cos(alpha) + center_x, r * math.sin(alpha) + center_y


def generate_messages():
    """This function generates messages (iterator) be sent to the server from the stub (client).
    src: https://grpc.io/docs/languages/python/basics/#response-streaming-rpc

    Yields:
        CoordinateRequest: a proto message containing an (x, y) coordinate and the corresponding timestamp
    """
    # We are making use of protobuf's Timestamp() to transfer timestamps
    timestamp = Timestamp()
    # Inifinite loop to send data from stub (client) to the server
    while True:
        # stamp the data with current date + time
        timestamp.FromDatetime(datetime.datetime.now())
        # construct the message
        msg = coordinate_pb2.CoordinateRequest(
            x=generate_random_pnt_circle(10, 0, 0)[0],
            y=generate_random_pnt_circle(10, 0, 0)[1],
            t=timestamp,
        )
        log.info(
            f"Sending ({msg.x}, {msg.y}) at {datetime.datetime.fromtimestamp(msg.t.seconds + msg.t.nanos / 1e9)}"
        )
        yield msg


def send_message(stub):
    """Calling the request-streaming generate_message()
    src: https://grpc.io/docs/languages/python/basics/#request-streaming-rpc-1

    Args:
        stub: The client in this case
    """
    response = stub.ReceiveCoordination(generate_messages())
    log.warning(
        response
    )  # this is the message sent by the server upon receiving all coordinates (in case they're finite)


def run():
    """Create  the client"""
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
