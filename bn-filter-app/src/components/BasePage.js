import React, {Component} from 'react';
import StartMenu from './StartMenu';
import ParametersForm from "./ParametersForm";
import DataForm from "./DataForm";
import RenderedPlot from "./RenderedPlot";
import Loading from "./Loading";
import Error from "./Error";
import {field} from "../config.json";
import {DateS} from "../utils/Date";
import {confIntZip} from "../utils/Utils";

export class BasePage extends Component {
    state = {
        step: 1,
        unprocessedY: '',
        x: [], // dates
        y: [], // processed time series
        fixedDelta: field.freeText.fixedDelta.default,
        deltaSelect: 2,
        demean: field.optionField.iterativeDynamicDemeaning.default,
        iterativeBackcasting: true,
        rollingWindow: field.freeText.rollingWindow.default,
        periodicity: field.optionField.periodicityManual.default, // periodicity
        startDate: null,
        transform: false, // transforms to data before bnf
        dCode: field.optionField.dCode.default,
        pCode: field.optionField.pCode.default,
        takeLog: false,
        // bnf output (from API)
        cycle: [],
        dispCycleCI: false,
        cycleCI: [],
        deltaCalc: undefined,
        cycleCILB: [],
        cycleCIUB: [],
        loading: true,
        errorMessage: {},
    }

    baseBackendURL = 'https://bn-filtering.herokuapp.com';
    bnfUserSpecifiedDataSlug = "/bnf/user-specified-time-series";
    bnfFredDataSlug = "/bnf/fred-time-series";
    fredDataSlug = "/fred-time-series";


    nextStep = () => {
        const {step} = this.state;
        this.setState({
            step: step + 1
        });
    }

    prevStep = () => {
        const {step} = this.state;
        this.setState({
            step: step - 1
        });
    }

    cancelLoad = () => {
        this.setState({loading: null});
    }

    handleChange = input => e => {
        this.setState({[input]: e.target.value});
    }

    handleCheckboxChange = input => e => {
        this.setState({[input]: e.target.checked});
    }

    setErrorMessage = (input, message) => {
        this.setState({
            errorMessage: {
                ...this.state.errorMessage,
                [input]: message
            }
        });
    }

    deleteErrorMessage = input => {
        let state = {...this.state};
        delete state["errorMessage"][input];
        this.setState(state);
    }

    isEmptyString = (v, input) => {
        if (v === "") {
            this.setErrorMessage(input, "must not be empty");
            return true;
        }
        return false;
    }

    isNotANum = (v, input) => {
        if (isNaN(v)) {
            this.setErrorMessage(input, "must be numeric");
            return true;
        }
        return false;
    }

    isNotAnInt = (v, input) => {
        if ((v % 1) !== 0) {
            this.setErrorMessage(input, "must be an integer");
            return true;
        }
        return false;
    }

    isExceedsMinMax = (v, input) => {
        if (v < field.freeText[input].min) {
            this.setErrorMessage(input, `must be ≥ ${field.freeText[input].min}`);
            return true;
        }
        if (v > field.freeText[input].max) {
            this.setErrorMessage(input, `must be ≤ ${field.freeText[input].max}`);
            return true;
        }
        return false;
    }

    handleErrorField = isCorrectEntry => (input, v) => {
        if (isCorrectEntry) this.deleteErrorMessage(input);
        this.setState({[input]: v});
    }

    validateField = (arr, input, e) => {
        // functions earlier in the array take precedence. [first_validated...last_validated]
        const v = e.target.value;
        const isIncorrectEntry = arr.reduce((total, currentValue) =>
                                                total ? true : currentValue(v, input) || total, false)
        this.handleErrorField(!isIncorrectEntry)(input, v)
    }

    handleNumberFieldChange = input => e => {
        this.validateField([this.isEmptyString, this.isNotANum, this.isExceedsMinMax, ], input, e);
    }

    handleIntegerNumberFieldChange = input => e => {
        this.validateField([this.isEmptyString, this.isNotAnInt, this.isNotANum, this.isExceedsMinMax, ], input, e);
    }

    getResults = async () => {

        // dealing with all operating system's newline characters
        this.state.y = this.state.unprocessedY.replace(/(,?(\r\n|\n|\r))|(,\s)/gm, ",")
            .split(",")
            .filter(x => x !== "")

        const statePairToParam = (paramName, currPair) =>
            paramName + currPair[0].toString() + '=' + currPair[1].toString() + '&'

        const paramStr =
            [['window', this.state.rollingWindow],
                ['delta_select', this.state.deltaSelect],
                ['fixed_delta', this.state.fixedDelta],
                ['ib', this.state.iterativeBackcasting],
                ['demean', this.state.demean],
                ['processed_y', this.state.y]].concat(
                [['transform', this.state.transform]].concat(
                    this.state.transform ? [
                            ['p_code', this.state.pCode],
                            ['d_code', this.state.dCode],
                            ['take_log', this.state.takeLog]]
                        : []
                )
            )
                .reduce(statePairToParam, '?');

        const finalURL = this.baseBackendURL + this.bnfUserSpecifiedDataSlug + paramStr

        console.log(finalURL)

        this.setState({loading: true}, async () => {
            fetch(finalURL)
                .then((response) => {
                    if (response.status !== 200) {
                        this.cancelLoad();
                        throw new Error("bad status");
                    } else {
                        return response;
                    }
                })
                .then((response) => response.json())
                .then(result => {
                    console.log('Success:', result);

                    const
                        cycleRes = result["cycle"].map(x => Number(x)),
                        ciRes = result["ci"].map(x => Number(x)),
                        deltaRes = Number(result["delta"]);

                    this.setState({
                        x: this.state.periodicity !== "n" ? // dated axis or numbered axis
                            DateS.createDate(this.state.periodicity, this.state.startDate).getDateArray(cycleRes.length).map(DateS.getTruncatedDate)
                            : Array.from({length: cycleRes.length}, (_, i) => i + 1),
                        cycle: cycleRes,
                        cycleCI: ciRes,
                        deltaCalc: deltaRes,
                        cycleCILB: confIntZip(cycleRes, ciRes, "lb"),
                        cycleCIUB: confIntZip(cycleRes, ciRes, "ub"),
                        loading: false,
                    })

                }).catch((error) => {
                console.log(error)
            });
        });
    }


    render() {
        const {unprocessedY, startDate, periodicity,} = this.state;
        const dataFormPageValues = {unprocessedY, startDate, periodicity,};

        const {
            step,
            fixedDelta,
            deltaSelect,
            demean,
            iterativeBackcasting,
            rollingWindow,
            transform,
            dCode,
            pCode,
            takeLog,
            cycle,
            deltaCalc,
            errorMessage,
            loading,
            serverError,
        } = this.state;
        const parametersFormPageValues = {
            unprocessedY,
            fixedDelta,
            deltaSelect,
            demean,
            iterativeBackcasting,
            rollingWindow,
            transform,
            dCode,
            pCode,
            takeLog,
            errorMessage,
            loading,
            serverError,
        };

        const {handleChange, handleNumberFieldChange, handleIntegerNumberFieldChange,
            handleCheckboxChange, handleErrorField} = this;
        const handlers = {handleChange, handleNumberFieldChange, handleIntegerNumberFieldChange,
                        handleCheckboxChange, handleErrorField};

        const {x, y, dispCycleCI, cycleCILB, cycleCIUB,} = this.state;
        const plotPageValues = {x, y, cycle, deltaCalc, dispCycleCI, cycleCILB, cycleCIUB, periodicity, startDate,};

        return (
            <>
                {(() => {
                    switch (step) {
                        case 2:
                            return <DataForm
                                nextStep={this.nextStep}
                                prevStep={this.prevStep}
                                handleChange={this.handleChange}
                                handleCheckboxChange={this.handleCheckboxChange}
                                values={dataFormPageValues}
                            />
                        case 3:
                            return (
                                <>
                                    {this.state.loading === null ?
                                        <Error
                                            tagName={"During the running of the BN filter a problem occurred. Please check that the inputs are appropriate."}
                                            close={() => {
                                                this.setState({loading: false})
                                            }}/>
                                        : null}

                                    <ParametersForm
                                        nextStep={this.nextStep}
                                        prevStep={this.prevStep}
                                        cancelLoad={this.cancelLoad}
                                        handlers={handlers}
                                        getResults={this.getResults}
                                        values={parametersFormPageValues}
                                        errors={errorMessage}
                                    />
                                </>
                            )
                        case 4:
                            return (
                                <>
                                    {(() => {
                                        if (this.state.loading === true) {
                                            return Loading();
                                        } else if (this.state.loading === false) {
                                            return (
                                                <RenderedPlot
                                                    prevStep={this.prevStep}
                                                    plotPageValues={plotPageValues}
                                                />)
                                        } else {
                                            // error
                                            this.prevStep();
                                        }
                                    })()}
                                </>
                            )
                        default: // case 1
                            return <StartMenu
                                nextStep={this.nextStep}
                                handleChange={this.handleChange}
                            />
                    }
                })()}
            </>
        )

    }
}

export default BasePage