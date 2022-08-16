import grpc
import random
import math
import logging
import datetime
import os

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc
from google.protobuf.timestamp_pb2 import Timestamp

from dotenv import load_dotenv
load_dotenv()  # take environment variables from .env.
GRPC_HOST=os.getenv('GRPC_HOST')
MAX_DATA_RATE = 3000 # In Hz

def generate_random_pnt_circle(radius, center_x, center_y, alpha):
    """This function generates a random point inside a circle

    Args:
        radius (int): radius of the circle
        center_x (int): x-coordinate of circle's center point
        center_y (int): y-coordinate of circle's center point

    Returns:
        int, int: a random point inside a circle
    """
    # calculate and return coordinates
    return radius * math.cos(alpha) + center_x, radius * math.sin(alpha) + center_y


def stream_coordinations_logic():
    """This function generates messages (iterator) be sent to the server from the stub (client).
    src: https://grpc.io/docs/languages/python/basics/#response-streaming-rpc

    Yields:
        StreamCoordinateRequest: a proto message containing an (x, y) coordinate and the corresponding timestamp
    """
    # We are making use of protobuf's Timestamp() to transfer timestamps
    timestamp = Timestamp()

    alpha=0
    r=0
    count=0
    lastHzCalculate=datetime.datetime.now()
    lastTime=datetime.datetime.now()

    # Inifinite loop to send data from stub (client) to the server
    while True:
        count += 1
        alpha += 0.001
        r += 0.0001
        # stamp the data with current date + time
        timestamp.FromDatetime(datetime.datetime.now())
        # construct the message
        msg = coordinate_pb2.StreamCoordinateRequest(
            x=generate_random_pnt_circle(10* math.sin(r), 0, 0, alpha)[0],
            y=generate_random_pnt_circle(10 * math.sin(r), 0, 0, alpha)[1],
            t=timestamp,
        )

        # Throttle the data sent to 
        while (datetime.datetime.now() - lastTime) < datetime.timedelta(microseconds=1000000 / MAX_DATA_RATE):
            pass

        lastTime=datetime.datetime.now()

        # Display the Actual Data rate every second
        if count == MAX_DATA_RATE:
            now = datetime.datetime.now()
            log.info(f"Outgoing GRPC rate is {round( MAX_DATA_RATE/(now - lastHzCalculate).total_seconds())}Hz")
            count = 0
            lastHzCalculate = now


        #log.info(
        #    f"Sending ({msg.x}, {msg.y}) at {datetime.datetime.fromtimestamp(msg.t.seconds + msg.t.nanos / 1e9)}"
        #)
        yield msg


calibrated_quads = [False, False,  False,  False]

def is_calibrated():
    return calibrated_quads[0] and calibrated_quads[1] and calibrated_quads[2] and calibrated_quads[3]

def generate_calibration_stream():
    while not is_calibrated():
        yield coordinate_pb2.StreamCoordinateResponse()


def run():
    """Create  the client"""
    with grpc.insecure_channel(GRPC_HOST) as channel:
        stub = coordinate_pb2_grpc.CoordinateStub(channel)
        
        log.info("Calibration Initialized")

        # Calibration Starts
        for calibrationResponse in stub.calibrate(generate_calibration_stream()):
            if calibrationResponse.quad !=-1:
                calibrated_quads[calibrationResponse.quad] = True
                log.info(f"Calibration received for quad {calibrationResponse.quad}") 
            else:
                log.info("Waiting")

        log.info("Calibration Finalized") 

        stub.streamCoordinate(stream_coordinations_logic())

    
# setup logging
logging.basicConfig(
    format=" %(asctime)s | %(name)s : %(levelname)s | %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("client")

# execute
run()
