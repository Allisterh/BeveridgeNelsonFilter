import React from "react";
import {LocalizationProvider} from "@mui/lab";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import {TextField} from "@mui/material";

function CustomDatePicker(props) {
    const [value, setValue] = React.useState(new Date('2014-08-18T21:11:54'));

    const handleChange = (newValue) => {
        setValue(newValue);
    };


    return (
        <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                    label="Time Series Start Date"
                    inputFormat="dd/MM/yyyy"
                    value={value}
                    InputProps={{style: {width: 220}}}
                    onChange={handleChange}
                    disabled={props.isDisabled}
                    renderInput={(params) => <TextField {...params} />}
                />
            </LocalizationProvider>
        </div>
    );
}

export default CustomDatePicker;