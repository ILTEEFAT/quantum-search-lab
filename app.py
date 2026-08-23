from flask import Flask, render_template, request, jsonify
from classical_search import linear_search

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/search", methods=["POST"])
def search():
    data = request.json

    dataset = [int(x.strip()) for x in data["data"].split(",")]
    target = int(data["target"])

    result = linear_search(dataset, target)

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)