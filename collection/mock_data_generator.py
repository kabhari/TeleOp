import lzma
import math
from PIL import Image
from os import urandom
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

    def iterate(self):
        self.alpha += 0.001
        self.r += 0.0001
        return generate_random_pnt_circle(10 * math.sin(self.r), 0, 0, self.alpha)

    def blob(self):
        n = 200
        size = (n, n)
        img = Image.new("RGB", size)
        pixels = zip(urandom(n * n), urandom(n * n), urandom(n * n))  # R, G, B
        img.putdata(list(pixels))
        img_buffer = BytesIO()
        img.save(img_buffer, "PNG")
        return img_buffer
