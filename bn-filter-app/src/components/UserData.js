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
    TextField
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
        const {values, handleChange, handleCheckboxChange} = this.props;

        return (
            <div>

                <div className="information">
                    <Divider style={{fontSize: 'x-large'}}>Time Series Input and Transformations</Divider>
                    <p>Paste your chosen time series below.
                        <br/>
                        Each line must contain a numerical value. The next time-step must start on the next line (and so
                        on).
                        Pasting time series from a CSV will achieve the above.
                    </p>
                </div>
                <div>
                    <FormControl variant="standard" sx={{m: 1, minWidth: 300, paddingRight: 2}}>
                        <TextField
                            multiline
                            rows={20}
                            label="Time Series (y)"
                            title="Paste Chosen Time Series Here"
                            onChange={handleChange('unprocessedY')}
                            defaultValue={values.unprocessedY}
                        />
                    </FormControl>
                    <div style={{
                        width: "450px",
                        alignItems: "center",
                        display: "inline-block",
                    }}>
                        <Divider light style={{fontSize: 'large'}}>X-Axis</Divider>
                        <Grid container direction="column" sx={{minHeight: 200}} justifyContent="space-evenly"
                              alignItems="center">

                            <Grid item xs={6}>
                                <FormControl variant="standard" sx={{minWidth: 200}}>
                                    <InputLabel>Periodicity</InputLabel>
                                    <Select
                                        label="Periodicity"
                                        title=""
                                        onChange={handleChange('periodicity')}
                                        defaultValue={values.periodicity}
                                    >
                                        <MenuItem value={0}>Unspecified</MenuItem>
                                        <MenuItem value={'q'}>Quarterly</MenuItem>
                                        <MenuItem value={'m'}>Monthly</MenuItem>
                                        <MenuItem value={'f'}>Fortnightly</MenuItem>
                                        <MenuItem value={'w'}>Weekly</MenuItem>
                                        <MenuItem value={'d'}>Daily</MenuItem>
                                        <MenuItem value={'h'}>Hourly</MenuItem>
                                        <MenuItem value={'m'}>By The Minute</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <CustomDatePicker/>
                            </Grid>
                        </Grid>

                        <Divider light > <FormControl variant="standard">
                            <FormControlLabel label="Transformations"
                                              control={<Checkbox
                                                  onChange={handleCheckboxChange('transform')}
                                                  checked={values.transform}/>}
                            />
                        </FormControl></Divider>
                        <Grid container direction="column" sx={{minHeight: 360}} justifyContent="space-evenly"
                              alignItems="center">
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{minWidth: 240}}>
                                    <FormControlLabel label="Perform Natural Logarithm Transform"
                                                      control={<Checkbox
                                                          onChange={handleCheckboxChange('takeLog')}
                                                          checked={values.takeLog}
                                                          disabled={!values.transform}/>}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{minWidth: 320}}>
                                    <InputLabel>Computed Percentages</InputLabel>
                                    <Select
                                        label="Percentages Computed"
                                        title="Percentages Computed"
                                        onChange={handleChange('pCode')}
                                        defaultValue={values.pCode}
                                        disabled={!values.transform}
                                    >
                                        <MenuItem value={'np'}>No Change</MenuItem>
                                        <MenuItem value={'p1'}>Multiply by 100</MenuItem>
                                        <MenuItem value={'p4'}>Multiply by 400 (Annualised Quarterly Rate)</MenuItem>
                                        <MenuItem value={'p12'}>Multiply by 1200 (Annualised Monthly Rate)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <FormControl variant="standard" sx={{minWidth: 320}}>
                                    <InputLabel>Differencing Method</InputLabel>
                                    <Select
                                        label="Differencing Method"
                                        title="Differencing Method"
                                        onChange={handleChange('dCode')}
                                        defaultValue={values.dCode}
                                        disabled={!values.transform}
                                    >
                                        <MenuItem value={'nd'}>No Differencing (Levels)</MenuItem>
                                        <MenuItem value={'d1'}>1st Difference</MenuItem>
                                        <MenuItem value={'d4'}>4th Difference (Ideal for Quarterly Data)</MenuItem>
                                        <MenuItem value={'d12'}>12th Difference (Ideal for Monthly Data)</MenuItem>
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

            </div>
        )
    }
}


const styles = {
    button: {
        margin: 15
    }
}

export default UserData