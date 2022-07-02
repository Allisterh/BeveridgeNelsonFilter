import React, {Component} from "react";
import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel, FormGroup, FormHelperText,
    Grid,
    InputLabel,
    Select,
    TextField,
} from "@mui/material";
import {withStyles} from "@mui/styles";
import CustomDatePicker from "../pickers/CustomDatePicker";
import createMenuItems from "../utils/CreateMenuItem";
import {field, URL} from "../config.json";
import {pairArrayToParamStr} from "../utils/Utils";
import Error from "./Error";
import {ThreeDots} from "react-loader-spinner";

export class FREDDataForm extends Component {

    state = {
        mnemonic: this.props.values.mnemonic,
        isBadMnemonic: this.props.errors['mnemonic'],
        loading: false,
    }



    createFilteredFrequencies = () => {
        const items = field.optionField.frequencyFRED.option.filter(x => this.props.values.availableFrequencies.includes(x.value));
        return createMenuItems(items);
    }

    checkAvailability = () => {
        const
            paramStr = pairArrayToParamStr([['fred_abbr', this.state.mnemonic]]),
            finalURL = URL.baseBackendURL + URL.fredDataSlug + paramStr;

        this.setState({loading: true}, async () => {
            fetch(finalURL)
                .then((response) => {
                    if (response.status !== 200) {
                        this.setState(
                            {
                                isBadMnemonic: true,
                                loading: false,
                                });
                        this.props.setErrorMessage("mnemonic", "The mnemonic is not available")

                        throw new Error("bad status");
                    } else {
                        return response;
                    }
                })
                .then((response) => response.json())
                .then(result => {
                    console.log('Success:', result);

                    const
                        startDate = new Date(result["start_date"]),
                        endDate = new Date(result["end_date"]);

                    this.setState({
                        loading: false,
                        isBadMnemonic: false,
                    });
                    this.props.deleteErrorMessage("mnemonic")
                    this.props.handleChange('mnemonic')({target: {value: this.state.mnemonic}});
                    this.props.handleChange('startDateFRED')({target: {value: startDate}});
                    this.props.handleChange('endDateFRED')({target: {value: endDate}});
                    this.props.handleChange('minDate')({target: {value: startDate}});
                    this.props.handleChange('maxDate')({target: {value: endDate}});
                    this.props.handleChange('availableFrequencies')({target: {value: result["available_frequencies"]}});
                    this.props.handleChange('frequencyFRED')({target: {value: result["available_frequencies"][0]}});

                }).catch((error) => {
                console.log(error);
            });
        });
    }

    mnemonicInput = () => {

        const noText = () => this.props.errors["mnemonic"] === undefined && this.props.values.mnemonic === ""
        const mnemonicHelperText = () => {
            if (noText()) {
                return "​"
            }
            else if(this.props.errors['mnemonic'] !== undefined) {
                return this.props.errors['mnemonic']
            } else return "The mnemonic is available"
        }


        return (
            <Grid container direction="column" sx={{minHeight: 100}}
                  justifyContent="space-evenly"
                  alignItems="center">
                <Grid item>
                    <FormGroup row>
                        <JoinedTextField variant="outlined" label="FRED mnemonic"
                                         color={this.props.errors["mnemonic"] === undefined && this.props.values.mnemonic !== "" ? "success" : null} placeholder="e.g. GDPC1" sx={{width: 250}}
                                         error={this.props.errors["mnemonic"] !== undefined}
                                         onChange={(e) => this.setState({mnemonic: e.target.value}) }
                                         defaultValue={this.state.mnemonic}
                                         InputProps={{
                                             endAdornment: this.state.loading ? <ThreeDots height={30} width={30} color='grey'/> : null}}/>
                        <JoinedButton onClick={this.checkAvailability} variant="outlined">Check</JoinedButton>
                    </FormGroup>
                    <FormHelperText>{mnemonicHelperText()}</FormHelperText>
                </Grid>
            </Grid>
        )
    }


    render() {
        const {values, handleChange, handleCheckboxChange} = this.props;

        return (
            <div>
                <div className="information">
                    <p>Choose a <a target="_blank"
                                                rel="noopener noreferrer"
                                                href="https://fred.stlouisfed.org/tags/series">
                        FRED mnemonic</a> and check its availability before continuing.</p>
                </div>
                <div style={{
                    width: "450px",
                    alignItems: "center",
                    display: "inline-block",
                }}>
                    {this.mnemonicInput()}
                    <Divider light
                             title="This option does not make alterations to the data but changes the display of the graph output"
                             style={{fontSize: 'large'}}>Options</Divider>

                    <Grid container direction="column" sx={{minHeight: 350,}}
                          justifyContent="space-evenly"
                          alignItems="center">
                        <Grid item xs={3}>
                            <CustomDatePicker
                                              label={"Start Date"}
                                              date={values.startDateFRED}
                                              minDate={values.minDate}
                                              maxDate={values.maxDate}
                                              updateDate={handleChange('startDateFRED')}/>
                        </Grid>
                        <Grid item xs={3}>
                            <CustomDatePicker
                                              label={"End Date"}
                                              date={values.endDateFRED}
                                              minDate={values.minDate}
                                              maxDate={values.maxDate}
                                              updateDate={handleChange('endDateFRED')}/>
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl variant="standard" sx={{minWidth: 220}}>
                                <InputLabel>Frequency</InputLabel>
                                <Select
                                    title="Time-series frequency (default aggregation method: average)"
                                    onChange={handleChange('frequencyFRED')}
                                    defaultValue={values.frequencyFRED}
                                >{this.createFilteredFrequencies()}</Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={3}>
                            <FormControl sx={{marginBottom: 3, marginTop: 2}} variant="standard">
                                <FormControlLabel label="95% Confidence Intervals"
                                                  title="Choose to display 95% confidence intervals in graph output"
                                                  control={<Checkbox
                                                      size="small"
                                                      onChange={handleCheckboxChange('dispCycleCI')}
                                                      checked={values.dispCycleCI}/>}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </div>
            </div>
        )
    }
}

const JoinedTextField = withStyles({
    root: {
        "& fieldset": {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        }
    }
})(TextField);

const JoinedButton = withStyles({
    root: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        backgroundColor: "#ede8e8",
        borderColor: "#454545",
        color: "black",
    }
})(Button);