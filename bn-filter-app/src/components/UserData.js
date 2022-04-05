import React, {Component} from 'react';
import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import '../styles/App.css';
import CustomDatePicker from "../pickers/CustomDatePicker";

export class UserData extends Component {


    continue = e => {

        e.preventDefault();
        // process form
        this.props.nextStep();
    }

    back = e => {
        e.preventDefault();
        this.props.prevStep();
    }

    render() {
        const {values, handleChange, handleCheckboxChange, getState} = this.props;

        return (
            <>

                <div className="information">
                    <Divider style={{fontSize: 'x-large'}}>Data and Transformations</Divider>
                    <p>Enter or paste in your chosen time series below.
                        <br/>
                        Each line must contain a numerical value. The next observation must start on the next line (and
                        so on). For example, pasting a time series from a CSV will achieve the appropriate formatting.
                    </p>
                </div>
                <div>
                    <FormControl variant="standard" sx={{m: 1, minWidth: 300, paddingRight: 2}}>
                        <TextField
                            multiline
                            rows={20}
                            label="Time Series (y)"
                            title="Paste your chosen time series here"
                            onChange={handleChange('unprocessedY')}
                            InputLabelProps={{
                                shrink: true
                            }}
                            // Hacky newline fix that works for all browsers
                            // (newline or line break not functioning in Safari)
                            placeholder={"e.g." + (new Array(100).join(" ")) +
                                "101.2" + (new Array(100).join(" ")) +
                                "104.8" + (new Array(100).join(" ")) +
                                "102.4" + (new Array(100).join(" ")) +
                                "..."}
                            defaultValue={values.unprocessedY}
                        />
                    </FormControl>
                    <div style={{
                        width: "450px",
                        alignItems: "center",
                        display: "inline-block",
                    }}>
                        <Divider light
                                 title="This option does not make alterations to the data but changes the display of the graph output"
                                 style={{fontSize: 'large'}}>Display Options</Divider>
                        <Grid container direction="column" sx={{minHeight: 250, paddingTop:4}} justifyContent="space-evenly"
                              alignItems="center">
                            <Grid item xs={4}>
                                <CustomDatePicker isDisabled={getState("periodicity") === 0}/>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControl variant="standard" sx={{minWidth: 220}}>
                                    <InputLabel>Data Frequency</InputLabel>
                                    <Select
                                        title="Time-series frequency"
                                        onChange={handleChange('periodicity')}
                                        defaultValue={values.periodicity}
                                    >
                                        <MenuItem value={'y'}>Yearly</MenuItem>
                                        <MenuItem value={'q'}>Quarterly</MenuItem>
                                        <MenuItem value={'m'}>Monthly</MenuItem>
                                        <MenuItem value={'w'}>Weekly</MenuItem>
                                        <MenuItem value={0}>Undated/Unspecified</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
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


                        <Divider light><FormControl variant="standard">
                            <FormControlLabel
                                label={<Typography
                                    style={styles.headingFormControlLabel}>Pre-Analysis Transformations</Typography>}
                                title="Transformations are applied in the order below and are done prior to the BN Filter run"
                                control={<Checkbox
                                    onChange={handleCheckboxChange('transform')}
                                    checked={values.transform}/>}
                            />
                        </FormControl></Divider>
                        <Grid container direction="column" sx={{minHeight: 340}} justifyContent="space-evenly"
                              alignItems="center">
                            <Grid item xs={3}>
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
                                <FormControl variant="standard" sx={{minWidth: 330}}>
                                    <InputLabel>Differencing Method</InputLabel>
                                    <Select
                                        title="Differencing method applied"
                                        onChange={handleChange('dCode')}
                                        defaultValue={values.dCode}
                                        disabled={!values.transform}
                                    >
                                        <MenuItem value={'nd'}>No Differencing (Levels)</MenuItem>
                                        <MenuItem value={'d1'}>1 Period Difference</MenuItem>
                                        <MenuItem value={'d4'}>4 Period Difference (for Quarterly Data)</MenuItem>
                                        <MenuItem value={'d12'}>12 Period Difference (for Monthly Data)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{minWidth: 330}}>
                                    <InputLabel>Computed Percentages</InputLabel>
                                    <Select
                                        title="Percentage multiple applied"
                                        onChange={handleChange('pCode')}
                                        defaultValue={values.pCode}
                                        disabled={!values.transform}
                                    >
                                        <MenuItem value={'np'}>No Change</MenuItem>
                                        <MenuItem value={'p1'}>Multiply by 100</MenuItem>
                                        <MenuItem value={'p4'}>Multiply by 400 (Annualized Quarterly Rate)</MenuItem>
                                        <MenuItem value={'p12'}>Multiply by 1200 (Annualized Monthly Rate)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <Button
                                    variant="contained"
                                    style={styles.button}
                                    onClick={this.back}
                                >Back</Button>
                                <Button
                                    variant="contained"
                                    style={styles.button}
                                    onClick={this.continue}
                                >Continue</Button>
                            </Grid>
                        </Grid>

                    </div>

                </div>

            </>
        )
    }
}


const styles = {
    button: {
        margin: 30

    },
    headingFormControlLabel: {fontSize: 'large'}
}


export default UserData