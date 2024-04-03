import {authenticate} from "../shopify.server";
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";
import {useQuery} from "@apollo/client";
import {GET_EARN_POINT} from "../graphql/query";
import {Badge, Page, Spinner} from "@shopify/polaris";

export async function loader({request, params}) {
    const {session} = await authenticate.admin(request);

    return json({session, id: params.id});
}

export default function EarnSingular() {
    const {session, id} = useLoaderData();

    const {loading: earnPLoading, data: earnP} = useQuery(GET_EARN_POINT, {
        variables: {
            input: {
                id: id,
            }
        }
    })

    if (earnPLoading) {
        return (
            <Page>
                <Spinner/>
            </Page>
        )
    }

    return (

        <Page
            title={earnP.getEarnPoint.name}
            backAction={{content: "Program", url: "../point_program"}}
            titleMetadata={earnP.getEarnPoint.status ? <Badge tone="success">Active</Badge> : <Badge tone="critical">Inactive</Badge> }
        >

        </Page>
    )
}
