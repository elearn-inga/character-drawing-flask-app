import os
from flask import Flask, render_template, request, redirect, url_for
import base64
import time
from PIL import Image
import io
import glob

app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def paintapp():
    global count
    if request.method == 'GET':
        return render_template("paint.html")
    if request.method == 'POST':
        filename = request.form['save_fname']
        data = request.form['save_cdata']
        canvas_image = request.form['save_image']
        canvas_image = canvas_image[len("data:image/png;base64,"):]

        binary_image = base64.b64decode(canvas_image)

        image_path = "images\{}_{}.png".format(filename, time.time())
        with open(image_path, "wb") as f:
            f.write(binary_image)

        image = Image.open(io.BytesIO(binary_image))

        image = image.resize((64, 64), resample=Image.BILINEAR)

        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[3])

        background.save(image_path)

        count = len(glob.glob(r"images\{}_*.png".format(filename)))

        return '{}'.format(count), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

