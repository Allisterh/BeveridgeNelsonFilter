import './styles/App.css';
import UserForm from './components/UserForm';
import React, {useState} from "react";
import {CSSTransition} from "react-transition-group";


function App() {
    const [showButton, setShowButton] = useState(true);
    const [showMessage, setShowMessage] = useState(false);
    return (
        <div className="App">
            <header className="appHeader">
                BN Filter Trend-Cycle Decomposition
            </header>

            <div className="information welcomeInformation">
                <p>This tool performs trend-cycle decomposition.
                    It is implemented using the method described in <a target="_blank" rel="noopener noreferrer"
                                                                       href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3434174">
                        Kamber, Morley, and Wong</a>, which is based on the Beveridge-Nelson filter.
                </p>

            </div>
            {/*<CSSTransition*/}
            {/*    in={showMessage}*/}
            {/*    timeout={300}*/}
            {/*    classNames="fade"*/}
            {/*    unmountOnExit*/}
            {/*    onEnter={() => setShowButton(false)}*/}
            {/*    onExited={() => setShowButton(true)}*/}
            {/*>*/}
                <>
            <UserForm/>
                </>
            {/*</CSSTransition>*/}
        </div>
    );
}

export default App;
