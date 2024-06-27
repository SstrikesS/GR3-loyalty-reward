import {redirect} from "@remix-run/node";

import indexStyles from "./style.css";
import {
    Page,
    FormLayout,
    TextField,
    Card,
    Spinner
} from "@shopify/polaris";
import CustomPolarisAppProvider from "~/components/CustomPolarisAppProvider";
import {useState} from "react";

export const links = () => [{rel: "stylesheet", href: indexStyles}];

export async function loader({request}) {
    const url = new URL(request.url);
    if (url.searchParams.get("shop")) {
        throw redirect(`/app?${url.searchParams.toString()}`);
    }

    return null;
}

export default function App() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error] = useState(null);
    const [isLoading] = useState(false);


    return (
        <CustomPolarisAppProvider>
            <div className="center-form">
                <Page>
                    <Card>
                        {
                            error ? (
                                <p style={{textAlign: 'center', color: 'red'}}>{error.message}</p>
                            ) : null
                        }
                        {
                            isLoading ? (<p style={{textAlign: 'center', color: 'red'}}>
                                <Spinner/>
                            </p>) : null
                        }
                        <FormLayout>
                            <TextField label="Username" value={username} onChange={(e) => setUsername(e)}
                                       autoComplete="off"/>
                            <TextField
                                type="password"
                                value={password}
                                label="Password"
                                onChange={(e) => setPassword(e)}
                                autoComplete="off"
                            />
                        </FormLayout>
                    </Card>
                </Page>
            </div>
        </CustomPolarisAppProvider>
    )
}
