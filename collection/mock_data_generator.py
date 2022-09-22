import math
from PIL import Image
from io import BytesIO


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


class mock_data_generator:
    alpha = 0
    r = 0

    frames = []
    frameIndex = 0

    def __init__(self):
        for i in range(16):
            img = Image.open(f'mock/{i}.png')
            img_buffer = BytesIO()
            img.save(img_buffer, "PNG")
            self.frames.append(img_buffer)

    def coordinate(self, data_rate):
        self.alpha += 5/data_rate
        self.r += 0.5/data_rate
        return generate_random_pnt_circle(10 * math.sin(self.r), 0, 0, self.alpha)

    def frame(self):
        self.frameIndex = 0 if self.frameIndex > len(self.frames)-2 else  self.frameIndex + 1
        return self.frames[self.frameIndex]