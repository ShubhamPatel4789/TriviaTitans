import React from 'react';

const Leaderboards= () => {
    return (
        <div>
            <br/>
            <br/>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'row' }}>
                <>
                    <iframe width="600" height="450"
                            src="https://lookerstudio.google.com/embed/reporting/3f8ca2b1-9107-4e79-9d36-3379ce01e13c/page/yXcYD"
                             allowFullScreen></iframe>
                    <iframe width="600" height="450"
                            src="https://lookerstudio.google.com/embed/reporting/eb8b1c4b-d878-4b85-873e-920de30bec81/page/2mcYD"
                             allowFullScreen></iframe>
                </>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'row' }}>
                <>
                <iframe width="600" height="450"
                        src="https://lookerstudio.google.com/embed/reporting/77bec38f-ecd3-4176-a7d9-6e6688a0ec5e/page/CzcYD"
                         allowFullScreen></iframe>
                <iframe width="600" height="450"
                        src="https://lookerstudio.google.com/embed/reporting/eaaa9ad0-da63-4726-a44f-7c22f8d74718/page/jrcYD"
                        allowFullScreen></iframe>
                </>
            </div>
        </div>
    );
};

export default Leaderboards;
