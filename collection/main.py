import grpc
import random
import logging
import datetime
import os

import proto.coordinate_pb2 as coordinate_pb2
import proto.coordinate_pb2_grpc as coordinate_pb2_grpc
from google.protobuf.timestamp_pb2 import Timestamp

from dotenv import load_dotenv

from mock_data_generator import mock_data_generator
load_dotenv()  # take environment variables from .env.
GRPC_HOST=os.getenv('GRPC_HOST')
MAX_DATA_RATE = 3000 # In Hz

mock_data = mock_data_generator()

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

        # Display the Actual Data rate every second
        count += 1
        if count == MAX_DATA_RATE:
            now = datetime.datetime.now()
            log.info(f"Outgoing GRPC rate is {round( MAX_DATA_RATE/(now - lastHzCalculate).total_seconds())}Hz")
            count = 0
            lastHzCalculate = now

        # stamp the data with current date + time
        timestamp.FromDatetime(datetime.datetime.now())

        # SEND COORDINATION HERE --------------------------------------------------------------
        # construct the message
        msg = coordinate_pb2.StreamCoordinateRequest(
            x=mock_data.iterate()[0],
            y=mock_data.iterate()[1],
            t=timestamp,
        )
        # SEND COORDINATION HERE --------------------------------------------------------------

        # Throttle the data sent to 
        while (datetime.datetime.now() - lastTime) < datetime.timedelta(microseconds=1000000 / MAX_DATA_RATE):
            pass

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

    
# setup logging
logging.basicConfig(
    format=" %(asctime)s | %(name)s : %(levelname)s | %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("client")

# execute
run()
