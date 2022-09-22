import grpc
import logging
import datetime
import os

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc
from google.protobuf.timestamp_pb2 import Timestamp
import base64
from threading import Thread


from dotenv import load_dotenv

from mock_data_generator import mock_data_generator
load_dotenv()  # take environment variables from .env.
GRPC_HOST=os.getenv('GRPC_HOST')
DATA_RATE_COORDINATIONS = 50 # Hz
DATA_RATE_VIDEO = 20 # Hz

mock_data = mock_data_generator()

def stream_video_logic():
    # We are making use of protobuf's Timestamp() to transfer timestamps
    timestamp = Timestamp()

    count=0
    lastHzCalculate=datetime.datetime.now()
    lastTime=datetime.datetime.now()

    # Inifinite loop to send data from stub (client) to the server
    while True:

        # Throttle the data sent to 
        while (datetime.datetime.now() - lastTime) < datetime.timedelta(microseconds=1000000 / DATA_RATE_VIDEO):
            pass

        lastTime=datetime.datetime.now()

        # Display the Actual Data rate every second
        count += 1
        if count == DATA_RATE_VIDEO:
            now = datetime.datetime.now()
            log.info(f"VIDEO Outgoing GRPC rate is {round( DATA_RATE_VIDEO/(now - lastHzCalculate).total_seconds())}Hz")
            count = 0
            lastHzCalculate = now

        # stamp the data with current date + time
        timestamp.FromDatetime(datetime.datetime.now())

        data = base64.b64encode(mock_data.frame().getvalue())

        # SEND COORDINATION HERE --------------------------------------------------------------
        # construct the message
        msg = coordinate_pb2.StreamVideoRequest(
            data =  data,
            t = timestamp,
        )
        # SEND COORDINATION HERE --------------------------------------------------------------

        yield msg

def stream_coordinations_logic():
    """This function generates messages (iterator) be sent to the server from the stub (client).
    src: https://grpc.io/docs/languages/python/basics/#response-streaming-rpc

    Yields:
        StreamCoordinateRequest: a proto message containing an (x, y) coordinate and the corresponding timestamp
    """
    # We are making use of protobuf's Timestamp() to transfer timestamps
    timestamp = Timestamp()

    count=0
    lastHzCalculate=datetime.datetime.now()
    lastTime=datetime.datetime.now()

    # Inifinite loop to send data from stub (client) to the server
    while True:

        # Throttle the data sent to 
        while (datetime.datetime.now() - lastTime) < datetime.timedelta(microseconds=1000000 / DATA_RATE_COORDINATIONS):
            pass
        
        # Display the Actual Data rate every second
        count += 1
        if count == DATA_RATE_COORDINATIONS:
            now = datetime.datetime.now()
            log.info(f"COORDINATE Outgoing GRPC rate is {round( DATA_RATE_COORDINATIONS/(now - lastHzCalculate).total_seconds())}Hz")
            count = 0
            lastHzCalculate = now

        # stamp the data with current date + time
        timestamp.FromDatetime(datetime.datetime.now())

        # SEND COORDINATION HERE --------------------------------------------------------------
        # construct the message
        xy = mock_data.coordinate(DATA_RATE_COORDINATIONS)
        msg = coordinate_pb2.StreamCoordinateRequest(
            x=xy[0],
            y=xy[1],
            t=timestamp,
        )
        # SEND COORDINATION HERE --------------------------------------------------------------

        lastTime=datetime.datetime.now()

        yield msg

def generate_calibration_stream():
    while not is_calibrated():
        yield coordinate_pb2.CalibrateRequest()
    
# CALIBRATION PARAMETERS AND END CONDITION --------------------------------------------------------------
calibrated_quads = [False, False,  False,  False]
def is_calibrated():
    return calibrated_quads[0] and calibrated_quads[1] and calibrated_quads[2] and calibrated_quads[3]
# CALIBRATION PARAMETERS AND END CONDITION --------------------------------------------------------------


def run():
    """Create  the client"""
    with grpc.insecure_channel(GRPC_HOST) as channel:
        stub = coordinate_pb2_grpc.CoordinateStub(channel)
        
        log.info("Calibration Initialized")
        # CALIBRATION LOGIC --------------------------------------------------------------
        for calibrationResponse in stub.calibrate(generate_calibration_stream()):
            if calibrationResponse.quad !=-1:
                calibrated_quads[calibrationResponse.quad - 1] = True
                log.info(f"Calibration received for quad {calibrationResponse.quad}") 
            else:
                log.info("Waiting")
        # CALIBRATION LOGIC --------------------------------------------------------------
        log.info("Calibration Finalized") 

        stub.streamCoordinate(stream_coordinations_logic())
            

def run2():
    with grpc.insecure_channel(GRPC_HOST) as channel:
        stub = coordinate_pb2_grpc.VideoStub(channel)
        stub.streamVideo(stream_video_logic())
    
# setup logging
logging.basicConfig(
    format=" %(asctime)s | %(name)s : %(levelname)s | %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("client")

# execute
threads = [run, run2]
for thread in threads:
    Thread(target=thread).start()
