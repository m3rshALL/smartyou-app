'use client';

import { AnimatePresence, motion } from "framer-motion";

import Widget from "@/shared/ui/Widget";
import { useGameStore } from "../model/useGameStore";

export default function Game() {
    const {
        playerRunning,
        playerJumping,
        playerDead,
        isCactusSpawned,
        completed,
    } = useGameStore();

    return (
        <Widget
            className="min-h-[500px] md:grow"
            title="Игровая панель"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="m272-440 208 120 208-120-168-97v137h-80v-137l-168 97Zm168-189v-17q-44-13-72-49.5T340-780q0-58 41-99t99-41q58 0 99 41t41 99q0 48-28 84.5T520-646v17l280 161q19 11 29.5 29.5T840-398v76q0 22-10.5 40.5T800-252L520-91q-19 11-40 11t-40-11L160-252q-19-11-29.5-29.5T120-322v-76q0-22 10.5-40.5T160-468l280-161Zm0 378L200-389v67l280 162 280-162v-67L520-251q-19 11-40 11t-40-11Zm40-469q25 0 42.5-17.5T540-780q0-25-17.5-42.5T480-840q-25 0-42.5 17.5T420-780q0 25 17.5 42.5T480-720Zm0 560Z" /></svg>
            }
            windowMode
        >
            <div className="h-full w-full relative overflow-hidden bg-[#73c5f1]">

                {/* Игрок */}
                <AnimatePresence>
                    {playerRunning && (
                        <motion.img
                            className="absolute bottom-48 h-24 aspect-auto z-100 image-render-pixel"
                            src={'/player.png'}
                            alt="Player character"
                            initial={{ x: "-100%" }}
                            animate={
                                playerDead
                                    ? {
                                        x: [
                                            260, 270, 280, 290, 300, 310, 320,
                                            330, 340, 350, 360, 370, 380, 390,
                                            400, 405, 410, 415, 420
                                        ],
                                        y: [
                                            0, -5, -10, -15, -20, -25, -30,
                                            -35, -38, -40, -38, -35, -30, -20,
                                            -10, 0, 10, 30, 50
                                        ],

                                    }
                                    : playerJumping
                                        ? {
                                            x: [
                                                250, 280, 310, 340, 370, 400, 430,
                                                460, 490, 520, 550, 575, 590, 600
                                            ],
                                            y: [
                                                0, -40, -75, -105, -130, -150, -160,
                                                -165, -160, -140, -110, -70, -35, 0
                                            ],
                                            opacity: 1,
                                        }
                                        : { x: 250, y: 0 }

                            }
                            transition={{
                                x: { duration: 0.8, ease: "easeInOut" },
                                y: { duration: 0.8, ease: "easeInOut" },
                                opacity: { duration: 0.5 }
                            }}
                            exit={{ opacity: 0 }}
                        />
                    )}
                </AnimatePresence>

                {isCactusSpawned && (
                    <motion.img
                        className="absolute bottom-48 h-24 aspect-auto right-0 image-render-pixel"
                        src={'/cactus.png'}
                        alt="Cactus obstacle"
                        initial={{ x: '100%' }}
                        animate={completed ? { x: -1000 } : { x: -250 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                    />
                )}

                {/* Земля */}
                <img className="absolute bottom-0 h-48 w-full image-render-pixel" src={'/ground.png'} alt="Ground texture" />
            </div>
        </Widget>
    );
}