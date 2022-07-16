import React, {Component} from 'react';
import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    Select,
    TextField,
} from "@mui/material";
import '../styles/App.css';
import {field, alertErrors} from "../config.json";
import createMenuItems from "../utils/CreateMenuItem";
import Error from "./Error";

export class ParametersForm extends Component {

    isDisabled = {
        rollingWindow: () => this.props.values.demean === "sm",
        delta: () => false, // this.props.values.deltaSelect !== 0,
    };

    isError = field => this.props.errors[field] !== undefined;

    isErrorDisplaying = field => this.isError(field) && (this.isDisabled[field] === undefined || !this.isDisabled[field]());

    errorsDisplayedCount = () => Object.keys(this.props.errors).map(key => this.isErrorDisplaying(key)).filter(x => x).length;

    continue = e => {
        e.preventDefault();
        const {getResults, getFREDResults, handlers, values, errors, cancelLoad} = this.props;

        if (values.dataInputType === "FRED" && errors["mnemonic"] !== undefined) {
            handlers.handleChange("alertErrorType")({target: {value: "INPUT_USER_M"}});
            cancelLoad();
        } else if (values.dataInputType === "USER" && errors["unprocessedY"] !== undefined) {
            handlers.handleChange("alertErrorType")({target: {value: "INPUT_USER_S"}});
            cancelLoad();
        }
        else if (this.errorsDisplayedCount() === 0) {
            if (values.dataInputType === "FRED") getFREDResults();
            else if (values.dataInputType === "USER") getResults();
            this.props.nextStep();
        } else {
            handlers.handleChange("alertErrorType")({target: {value: "INPUT_PARAM"}});
            cancelLoad();
        }
    }

    back = e => {
        e.preventDefault();
        this.props.prevStep();
    }

    preAnalysisTransformations = () => {
        const {values, handlers} = this.props;
        const {handleChange, handleCheckboxChange} = handlers;

        return (
            <>
                <div className="information">
                    <Divider style={{fontSize: 'x-large'}}>Transformations</Divider>
                </div>
                <Grid container direction="column" justifyContent="space-evenly" alignItems="center" spacing={3}>
                    <Grid item xs={4}>
                        <FormControl variant="standard">
                            <FormControlLabel label="Natural Logarithm"
                                              title="Logarithm to the base of Euler's number"
                                              control={<Checkbox
                                                  size="small"
                                                  onChange={handleCheckboxChange('takeLog')}
                                                  checked={values.takeLog}
                                                  disabled={!values.transform}/>}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <FormControl variant="standard" sx={{minWidth: 350}}>
                            <InputLabel>Differencing Method</InputLabel>
                            <Select
                                title="Differencing method applied"
                                onChange={handleChange('dCode')}
                                value={values.dCode}
                                disabled={!values.transform}
                            >{createMenuItems(field.optionField.dCode.option)}</Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl variant="standard" sx={{minWidth: 350}}>
                            <InputLabel>Computed Percentages</InputLabel>
                            <Select
                                title="Multiple applied"
                                onChange={handleChange('pCode')}
                                value={values.pCode}
                                disabled={!values.transform}
                            >{createMenuItems(field.optionField.pCode.option)}</Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </>)
    }

    bnFilterParameters = () => {

        const
            {values, handlers} = this.props,
            {handleChange, handleNumberFieldChange, handleIntegerNumberFieldChange} = handlers,
            errors = this.props.errors;

        const handleRollingWindowChange = () => {
            return handleIntegerNumberFieldChange('rollingWindow');
        }

        return (
            <>
                <div className="information">
                    <Divider style={{fontSize: 'x-large'}}>Filter Parameters</Divider>
                </div>
                <div style={{
                    width: "420px",
                    alignItems: "center",
                    display: "inline-block",
                }}>
                    <Grid container alignItems="flex-start" justifyContent="space-evenly" spacing={3}>
                        <Grid item xs={7.75}>
                            <FormControl variant="standard" sx={{ width: 280 }}>
                                <InputLabel>Signal-to-Noise Ratio (Delta)</InputLabel>
                                <Select
                                    label="Signal-to-Noise Ratio (Delta)"
                                    title={(() => {
                                        if(values.deltaSelect === 0) {
                                            return "Signal-to-Noise Ratio according to user input";
                                        } else if(values.deltaSelect === 1) {
                                            return "Signal-to-Noise Ratio according to benchmark KMW approach";
                                        } else if(values.deltaSelect === 2) {
                                            return "Signal-to-Noise Ratio according to KMW refinement";
                                        }
                                    })()}
                                    onChange={handleChange('deltaSelect')}
                                    value={values.deltaSelect}
                                >{createMenuItems(field.optionField.deltaSelect.option)}</Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4.25}>
                            <FormControl variant="standard" sx={{width: 140}}>
                                <TextField
                                    label={values.deltaSelect === 0 ? "Fixed Delta" : "Minimum Delta"}
                                    title={values.deltaSelect === 0 ? "Fixed delta for estimation" : "Minimum threshold start point for grid search (with grid increments of 0.0005)"}
                                    onChange={handleNumberFieldChange('delta')}
                                    value={values.delta}
                                    disabled={this.isDisabled['delta']()}
                                    error={this.isErrorDisplaying('delta')}
                                    helperText={this.isErrorDisplaying('delta') ?
                                        errors['delta'] : "​" /* zero whitespace to prevent height difference when error displays */}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={7.75}>
                            <FormControl variant="standard" sx={{minWidth: 280}}>
                                <InputLabel>Demeaning</InputLabel>
                                <Select
                                    label="Demeaning"
                                    title={(() => {
                                        if(values.demean === 'sm') {
                                            return "Estimate constant drift";
                                        } else if(values.demean === 'dm') {
                                            return "Estimate time-varying drift using rolling window";
                                        } else if(values.demean === 'idm') {
                                            return "Iteratively estimate time-varying drift removing cycle and using rolling window according to KMW refinement";
                                        }
                                    })()}
                                    onChange={handleChange('demean')}
                                    value={values.demean}
                                >{createMenuItems(field.optionField.iterativeDynamicDemeaning.option)}</Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4.25}>
                            <FormControl variant="standard" sx={{minWidth: 140}}>
                                <TextField
                                    label= "Rolling Window"
                                    title="Only active when using dynamic demeaning"
                                    onChange={handleRollingWindowChange()}
                                    value={values.rollingWindow}
                                    disabled={this.isDisabled['rollingWindow']()}
                                    error={this.isErrorDisplaying('rollingWindow')}
                                    helperText={this.isErrorDisplaying('rollingWindow') ?
                                        errors['rollingWindow'] : "​" /* zero whitespace to prevent height difference when error displays */}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </>
        )
    }

    render() {
        return (
            <>
                <div style={{minHeight: 600,}}>
                    {this.props.values.loading === null ?
                        <Error
                            tagName={alertErrors[this.props.values.alertErrorType]}
                            close={() => {this.props.handlers.handleChange("loading")({target: {value: false}})}}/>
                        : null}
                    {this.preAnalysisTransformations()}
                    {this.bnFilterParameters()}
                </div>
                <Button
                    variant="outlined"
                    style={styles.button}
                    onClick={this.back}
                >Back</Button>
                <Button
                    variant="contained"
                    style={styles.button}
                    onClick={this.continue}
                >Get Trend Decomposition</Button>
            </>
        )
    }
}


const styles = {
    button: {
        minHeight: "45px",
        minWidth: "100px",
        margin: "0 20px 100px",
    }
}

export default ParametersForm