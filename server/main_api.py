from GLOBAL_imp import *
import gc
from python_to_r_interface.TestTimeSeries import *
from python_to_r_interface.FREDTimeSeries import *
from python_to_r_interface.UserTimeSeries import *
from python_to_r_interface.Bnf import *
from pathlib import Path
import dicttoxml
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000",
                    "https://crstnn.github.io/BeveridgeNelsonFilter",
                    "https://bnfiltering"]
    }
})


@app.route('/')
def index():
    return "alive"


@app.route('/fred-time-series', methods=['GET'])
def fred_time_series():
    R = robj.r
    R.source(FILTER_FILEPATH + BNF_FUNCTIONS)
    fred_series = FREDTimeSeries(R)

    bnf = BNF(fred_series, R)

    return jsonify(bnf.run())


@app.route('/user-specified-time-series', methods=['GET'])
def user_specified_time_series():
    # lightweight backend validation as the majority of validation is done in frontend
    window = int(request.args.get("window"))
    delta_select = int(request.args.get("delta_select"))
    fixed_delta = float(request.args.get("fixed_delta")) if request.args.get("fixed_delta") else 0.05
    ib = request.args.get("ib") == "true"
    demean = request.args.get("demean")
    user_y = request.args.get("processed_y").split(",")

    R = robj.r
    R.source(FILTER_FILEPATH + BNF_FUNCTIONS)
    user_series = UserTimeSeries(R, user_y)

    if request.args.get("transform") == "true":
        user_series.d_code = request.args.get("d_code")
        user_series.p_code = request.args.get("p_code")
        user_series.take_log = request.args.get("take_log") == "true"

    print(user_series.get_time_series())

    bnf = BNF(user_series, R, window, delta_select, fixed_delta, ib, demean)

    print(bnf.run())

    return jsonify(bnf.run())


@app.route('/test-time-series', methods=['GET'])
def test_time_series():
    R = robj.r
    R.source(FILTER_FILEPATH + BNF_FUNCTIONS)
    us_gdp = TestTimeSeries(R)  # default GDPC1
    us_gdp.set_default_transformation()
    bnf = BNF(us_gdp,
              R,
              window=40,
              delta_select=2,
              fixed_delta=0.05,
              ib=True,
              demean="dm"
              )

    return jsonify(bnf.run())
