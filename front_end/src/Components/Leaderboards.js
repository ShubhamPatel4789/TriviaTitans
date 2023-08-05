import React from 'react';

// Define Leaderboards component
const Leaderboards = () => {
    return (
        <div>
            {/* Add some vertical spacing */}
            <br/>
            <br/>
            {/* First row of iframes */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'row' }}>
                <>
                    {/* First iframe */}
                    <iframe
                        width="600"
                        height="450"
                        src="https://lookerstudio.google.com/embed/reporting/3f8ca2b1-9107-4e79-9d36-3379ce01e13c/page/yXcYD"
                        allowFullScreen
                    ></iframe>
                    {/* Second iframe */}
                    <iframe
                        width="600"
                        height="450"
                        src="https://lookerstudio.google.com/embed/reporting/eb8b1c4b-d878-4b85-873e-920de30bec81/page/2mcYD"
                        allowFullScreen
                    ></iframe>
                </>
            </div>
            {/* Second row of iframes */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'row' }}>
                <>
                    {/* Third iframe */}
                    <iframe
                        width="600"
                        height="450"
                        src="https://lookerstudio.google.com/embed/reporting/77bec38f-ecd3-4176-a7d9-6e6688a0ec5e/page/CzcYD"
                        allowFullScreen
                    ></iframe>
                    {/* Fourth iframe */}
                    <iframe
                        width="600"
                        height="450"
                        src="https://lookerstudio.google.com/embed/reporting/eaaa9ad0-da63-4726-a44f-7c22f8d74718/page/jrcYD"
                        allowFullScreen
                    ></iframe>
                </>
            </div>
        </div>
    );
};

export default Leaderboards;
