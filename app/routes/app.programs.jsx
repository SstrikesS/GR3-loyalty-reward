import {
    InlineGrid,
    Card,
    Page,
} from "@shopify/polaris";

export default function Programs() {
    return (
        <Page title="Programs">
            <InlineGrid gap="500" columns={2}>
                <Card></Card>
                <Card></Card>
                <Card></Card>
                <Card></Card>
            </InlineGrid>

        </Page>
    );
}

