import React from 'react';

const GameplayData = () => {
    return (
        <div>
        <br/>
        <br/>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'row' }}>
            <>
                <iframe
                    width="600"
                    height="550"
                    src="https://lookerstudio.google.com/embed/reporting/a60f9460-5e70-4a0e-a754-5260f09e443c/page/6abYD"
                    frameBorder="0"
                    allowFullScreen
                ></iframe>
                <iframe
                    width="600"
                    height="550"
                    src="https://lookerstudio.google.com/embed/reporting/603722f0-f5b4-422d-a960-c4768d6d107a/page/UfbYD"
                    allowFullScreen
                ></iframe>
            </>
        </div>
        </div>
    );
};

export default GameplayData;
