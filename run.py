import os
from flask import Flask, render_template, request, redirect, url_for, jsonify
import base64
import time
from PIL import Image
import io
import glob
from keras.models import load_model
import json
import numpy as np
import tensorflow as tf

app = Flask(__name__)

#model = load_model("model/tengwar_digit_recognition.h5")

def load_keras_model():
    global model
    model = load_model("model/tengwar_digit_recognition.h5")
    # this is key : save the graph after loading the model
    global graph
    graph = tf.get_default_graph()

load_keras_model()

@app.route('/', methods=['GET', 'POST'])
def paintapp():
    global model
    if request.method == 'GET':
        return render_template("paint.html")
    if request.method == 'POST':
        filename = request.form['save_fname']
        data = request.form['save_cdata']
        canvas_image = request.form['save_image']
        predict = request.form["predict"]
        canvas_image = canvas_image[len("data:image/png;base64,"):]

        binary_image = base64.b64decode(canvas_image)

        image_path = "images\{}_{}.png".format(filename, time.time())
        with open(image_path, "wb") as f:
            f.write(binary_image)

        image = Image.open(io.BytesIO(binary_image))

        image = image.resize((64, 64), resample=Image.BILINEAR)

        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[3])

        if predict == False:
            background.save(image_path)
            count = len(glob.glob(r"images\{}_*.png".format(filename)))

            return json.dumps({"character_count": '{}'.format(count)})
        else:
            image_array = np.asarray(background, dtype=np.uint8)

            image_array_one_channel = image_array[:, :, 0]

            # Invert colors
            image_array_inverted = 255 - image_array_one_channel

            image_array_scaled = image_array_inverted / 255

            X = image_array_scaled.reshape(1, 64, 64, 1)


            with graph.as_default():
                #model._make_predict_function()
                proba_predicitons = model.predict_proba(X).reshape(-1).tolist()
                class_prediciton = model.predict_classes(X).tolist()[0]

            return json.dumps({"proba_predicitons": proba_predicitons,
                               "class_prediction": class_prediciton}), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
