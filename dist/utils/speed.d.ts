declare function runSpeedTest(): Promise<{
    downloadSpeed: number;
    uploadSpeed: number;
}>;
export default runSpeedTest;
