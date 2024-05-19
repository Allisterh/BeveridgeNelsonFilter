import React, {Component, useEffect, useState} from 'react';
import StartMenu from './StartMenu';
import ParametersForm from "./ParametersForm";
import DataForm from "./DataForm";
import DataPlot from "./DataPlot";
import Loading from "./Loading";
import Error from "./Error";
import {CONFIG} from "../config.js";
import {DateAbstract} from "../utils/date";
import {confIntZip, fetchWithTimeout, pairArrayToParamStr} from "../utils/utils";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";

const {field, URL} = CONFIG;

const BasePage = () => {
    const [state, setState] = useState({
        step: 1,
        dataInputType: 'FRED',
        mnemonic: '',
        unprocessedY: '',
        x: [], // dates
        y: [], // time series
        transformedY: [], // transformed y (only will differ from `y` if a transform is applied)
        delta: field.freeText.delta.default,
        deltaSelect: 2,
        demean: field.optionField.iterativeDynamicDemeaning.default,
        iterativeBackcasting: true,
        rollingWindow: field.freeText.rollingWindow.default,
        frequency: field.optionField.frequencyManual.default, // periodicity
        startDate: null,
        endDate: null,
        startDateFRED: null,
        minDate: null,
        maxDate: null,
        endDateFRED: null,
        availableFrequencies: [],
        frequencyFRED: field.optionField.frequencyFRED.default,
        transform: true, // transforms to data before bnf
        dCode: field.optionField.dCode.default,
        pCode: field.optionField.pCode.default,
        takeLog: true,
        // bnf output (from API)
        cycle: [],
        trend: [],
        displayConfInterval: true,
        cycleCI: [],
        deltaCalc: undefined,
        cycleCILB: [],
        cycleCIUB: [],
        trendCILB: [],
        trendCIUB: [],
        loading: true,
        alertErrorType: null, // overarching alert text
        fieldErrorMessages: {},
    })

    const setStateKey = (obj) => {setState({...state, ...obj})}

    const nextStep = () => {
        const {step} = state;
        setStateKey({
            step: step + 1
        });
    }

    const prevStep = () => {
        const {step} = state;
        setStateKey({
            step: step - 1
        });
    }

    const cancelLoading = () => {
        setStateKey({loading: null});
    }

    const handleChange = input => e => {
        setStateKey({[input]: e.target.value});
    }

    const handleCheckboxChange = input => e => {
        setStateKey({[input]: e.target.checked});
    }

    const setErrorMessage = (input, message) => {
        setStateKey({
            fieldErrorMessages: {
                ...state.fieldErrorMessages,
                [input]: message
            }
        });
    }

    const deleteErrorMessage = input => {
        const fieldErrorMessagesTemp = {...state.fieldErrorMessages};
        delete fieldErrorMessagesTemp[input];
        setStateKey({fieldErrorMessages: fieldErrorMessagesTemp});
    }

    const isEmptyString = (v, input) => {
        if (v === "") {
            setErrorMessage(input, "Must not be empty");
            return true;
        }
        return false;
    }

    const isNotANum = (v, input) => {
        if (isNaN(v)) {
            setErrorMessage(input, "Must be numeric");
            return true;
        }
        return false;
    }

    const isNotAnInt = (v, input) => {
        if ((v % 1) !== 0) {
            setErrorMessage(input, "Must be an integer");
            return true;
        }
        return false;
    }

    const isExceedsMinMax = (v, input) => {
        if (field.freeText[input].min !== null && v < field.freeText[input].min) {
            setErrorMessage(input, `Must be ≥ ${field.freeText[input].min}`);
            return true;
        }
        if (field.freeText[input].max !== null && v > field.freeText[input].max) {
            setErrorMessage(input, `Must be ≤ ${field.freeText[input].max}`);
            return true;
        }
        return false;
    }

    const handleErrorField = isCorrectEntry => (input, v) => {
        if (isCorrectEntry) deleteErrorMessage(input);
        setStateKey({[input]: v});
    }

    const validateField = (arr, input, e) => {
        // functions earlier in the array take precedence. [first_validated...last_validated]
        const v = e.target.value;
        const isIncorrectEntry = arr.reduce((total, currentValue) =>
            total ? true : currentValue(v, input) || total, false)
        handleErrorField(!isIncorrectEntry)(input, v)
    }

    const handleNumberFieldChange = input => e => {
        validateField([isEmptyString, isNotANum, isExceedsMinMax,], input, e);
    }

    const handleIntegerNumberFieldChange = input => e => {
        validateField([isEmptyString, isNotAnInt, isNotANum, isExceedsMinMax,], input, e);
    }

    const handleChangeValidation = input => e => validationArr => {
        validateField(validationArr, input, e);
    }

    const bnfParamArr = () => [['window', state.rollingWindow],
        ['delta_select', state.deltaSelect],
        ['delta', state.delta],
        ['ib', state.iterativeBackcasting],
        ['demean', state.demean],].concat(
        [['transform', state.transform]].concat(
            state.transform ? [
                    ['p_code', state.pCode],
                    ['d_code', state.dCode],
                    ['take_log', state.takeLog]]
                : []
        )
    )

    const fetchResultWithErrorHandling = async (finalURL) => {
        return fetchWithTimeout(finalURL)
            .catch(e => {
                setStateKey({alertErrorType: "TIMEOUT"});
                prevStep();
                cancelLoading();
                throw e;
            })
            .then((response) => {
                if (response.status !== 200) {
                    setStateKey({alertErrorType: "SERVER"});
                    prevStep();
                    cancelLoading();
                    throw new Error("bad status");
                } else {
                    return response.json();
                }
            });

    }

    const getResultsForFREDData = async () => {

        const paramStr = pairArrayToParamStr(
            [['fred_abbr', state.mnemonic],
                ['freq', state.frequencyFRED],
                ['obs_start', DateAbstract.truncatedDate(state.startDateFRED)],
                ['obs_end', DateAbstract.truncatedDate(state.endDateFRED)],
            ].concat(bnfParamArr())
        );

        const finalURL = URL.baseBackendURL + URL.bnfFredDataSlug + paramStr;

        console.log(finalURL);

        setStateKey({loading: true}, async () => {
            fetchResultWithErrorHandling(finalURL)
                .then(result => {
                    console.log('Success:', result);

                    const
                        cycleRes = result["cycle"],
                        trendRes = result["trend"],
                        ciRes = result["cycle_ci"];

                    setStateKey({
                        x: result["dates"],
                        y: result["original_y"],
                        transformedY: result["transformed_y"],
                        trend: trendRes,
                        cycle: cycleRes,
                        cycleCI: ciRes,
                        deltaCalc: result["delta"],
                        cycleCILB: confIntZip(cycleRes, ciRes, "lb"),
                        cycleCIUB: confIntZip(cycleRes, ciRes, "ub"),
                        trendCILB: confIntZip(trendRes, ciRes, "lb"),
                        trendCIUB: confIntZip(trendRes, ciRes, "ub"),
                        loading: false,
                    });
                }).catch((error) => {
                console.log(error);
            });
        });
    }

    const getResultsForUserSpecifiedData = async () => {

        // dealing with all operating system's newline characters
        const y = state.unprocessedY.replace(/(,?(\r\n|\n|\r))|(,\s)/gm, ",")
            .split(",")
            .filter(x => x !== "")

        setStateKey({y});

        const paramStr = pairArrayToParamStr([['processed_y', y]].concat(bnfParamArr()));

        const finalURL = URL.baseBackendURL + URL.bnfUserSpecifiedDataSlug + paramStr;

        console.log(finalURL);

        setStateKey({loading: true}, async () => {
            fetchResultWithErrorHandling(finalURL)
                .then(result => {
                    console.log('Success:', result);
                    const
                        cycleRes = result["cycle"],
                        trendRes = result["trend"],
                        ciRes = result["cycle_ci"];

                    setStateKey({
                        x: state.frequency !== "n" ? // dated axis or numbered axis
                            DateAbstract.createDate(state.frequency, state.startDate).getDateSeries(cycleRes.length).map(DateAbstract.truncatedDate)
                            : Array.from({length: cycleRes.length}, (_, i) => i + 1),
                        transformedY: result["transformed_y"],
                        trend: trendRes,
                        cycle: cycleRes,
                        cycleCI: ciRes,
                        deltaCalc: result["delta"],
                        cycleCILB: confIntZip(cycleRes, ciRes, "lb"),
                        cycleCIUB: confIntZip(cycleRes, ciRes, "ub"),
                        trendCILB: confIntZip(trendRes, ciRes, "lb"),
                        trendCIUB: confIntZip(trendRes, ciRes, "ub"),
                        loading: false,
                    });
                }).catch((error) => {
                console.log(error);
            });
        });
    }

    const {
        step,
        dataInputType,
        mnemonic,
        unprocessedY,
        x,
        y,
        transformedY,
        delta,
        deltaSelect,
        demean,
        iterativeBackcasting,
        rollingWindow,
        frequency,
        startDate,
        endDate,
        startDateFRED,
        minDate,
        maxDate,
        endDateFRED,
        availableFrequencies,
        frequencyFRED,
        transform,
        dCode,
        pCode,
        takeLog,
        cycle,
        trend,
        displayConfInterval,
        cycleCI,
        deltaCalc,
        cycleCILB,
        cycleCIUB,
        trendCILB,
        trendCIUB,
        loading,
        alertErrorType,
        fieldErrorMessages,
    } = state;



    const dataUserFormPageValues = {
        unprocessedY,
        startDate,
        endDate,
        frequency,
        dataInputType,
        displayConfInterval
    };
    const dataFREDFormPageValues = {
        startDateFRED,
        endDateFRED,
        minDate,
        maxDate,
        mnemonic,
        frequencyFRED,
        dataInputType,
        availableFrequencies,
        displayConfInterval
    };

    const parametersFormPageValues = {
        unprocessedY,
        delta,
        deltaSelect,
        demean,
        iterativeBackcasting,
        rollingWindow,
        transform,
        dCode,
        pCode,
        takeLog,
        loading,
        dataInputType,
        alertErrorType,
    };


    const handlers = {
        handleChange, handleNumberFieldChange, handleIntegerNumberFieldChange,
        handleCheckboxChange, handleErrorField
    };

    const plotPageValues = {
        x,
        y,
        transformedY,
        cycle,
        trend,
        deltaCalc,
        transform,
        displayConfInterval,
        cycleCI,
        cycleCILB,
        cycleCIUB,
        trendCILB,
        trendCIUB,
        frequency,
        startDate,
        dataInputType,
        mnemonic
    };

    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('here', location.pathname)
        if(location.pathname.endsWith('/apply')) {
            // TODO
            navigate('/') // base
        }

    }, [location]);

    console.log(state)

    return (
        <>
            {(() => {
                switch (step) {
                    case 2:
                        return <DataForm
                            nextStep={nextStep}
                            prevStep={prevStep}
                            setErrorMessage={setErrorMessage}
                            deleteErrorMessage={deleteErrorMessage}
                            handleChange={handleChange}
                            valuesUserData={dataUserFormPageValues}
                            valuesFREDData={dataFREDFormPageValues}
                            errors={fieldErrorMessages}
                        />
                    case 3:
                        return (
                            <>
                                <ParametersForm
                                    nextStep={nextStep}
                                    prevStep={prevStep}
                                    cancelLoad={cancelLoading}
                                    handlers={handlers}
                                    getResults={getResultsForUserSpecifiedData}
                                    getFREDResults={getResultsForFREDData}
                                    values={parametersFormPageValues}
                                    errors={fieldErrorMessages}
                                />
                            </>
                        )
                    case 4:
                        return (
                            <>
                                {loading ? Loading() : <DataPlot
                                    prevStep={prevStep}
                                    plotPageValues={plotPageValues}
                                    handleCheckboxChange={handleCheckboxChange}
                                />
                                }
                            </>
                        )
                    default: // case 1
                        return <StartMenu
                            nextStep={nextStep}
                            handleChange={handleChange}
                        />
                }
            })()}
        </>
    )

}

export default BasePage