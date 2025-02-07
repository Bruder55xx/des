import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
export declare function delay(ms: number): Promise<unknown>;
export declare function saveToFile(filename: string, data: string): Promise<void>;
export declare function readFile(pathFile: string): Promise<string[]>;
export declare const newAgent: (proxy?: string | null) => SocksProxyAgent | HttpsProxyAgent<string> | null;
