import React from "react";
import HomeContent from "../../components/HomeContent";
import DefaultAppLayout from "../Layout";

const HomePage = () => {
    return (
        <DefaultAppLayout
            content={
                HomeContent()
            }
        />
    )
}
export default HomePage;
