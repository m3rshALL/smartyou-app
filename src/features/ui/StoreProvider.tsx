'use client';

import { useGameProfile } from "../model/useGameProfile";
import { useCompletedLevels } from "../model/useLevels";
import { useEffect } from "react";
import Cookies from "js-cookie";

function StoreProvider() {
    const { name, setName } = useGameProfile();
    const { completedLevels, setCompletedLevels } = useCompletedLevels();

    useEffect(() => {
        const cookieName = Cookies.get("name");
        if (cookieName) setName(cookieName);

        const completed = Cookies.get("completedLevels");
        if (completed !== undefined) {
            const parsed = Number(completed);
            setCompletedLevels(isNaN(parsed) ? 0 : parsed);
        }
    }, []);

    useEffect(() => {
        if (name) Cookies.set("name", name, { expires: 7 });
    }, [name]);

    useEffect(() => {
        Cookies.set("completedLevels", String(completedLevels), { expires: 7 });
    }, [completedLevels]);

    return null;
}

export default StoreProvider;