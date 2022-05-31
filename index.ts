import alfy from 'alfy';
import fs from "fs";
import os from "os";
import {Element, xml2js} from "xml-js";

const preferencesBasePath = `${os.homedir()}/Library/Application Support/JetBrains/`;

export async function invoke(app: string) {
    const folders = fs.readdirSync(preferencesBasePath);
    const appDir = folders.filter(name => name.startsWith(app)).reduce((p, v) => (p && p > v) ? p : v)
    if (appDir) {
        const recentPreferencesFile = `${preferencesBasePath}${appDir}/options/recentProjects.xml`;
        const recentPreferences = fs.readFileSync(recentPreferencesFile, {encoding: 'utf8'});
        const recentPreferencesObj = xml2js(recentPreferences) as Element
        const items = [{arg: '', title: 'Open', subtitle: ''}, ...recentPreferencesObj.elements!.find(e => e.name === 'application')!
            .elements!.find(e => e.name === 'component')!
            .elements!.find(e => e.name === 'option' && e.attributes!.name === 'additionalInfo')!
            .elements!.find(e => e.name === 'map')!
            .elements!.map(e => {// .filter(e => e.attributes.opened !== 'true')
                const arg = `${e.attributes!.key}`.replace('$USER_HOME$', os.homedir());
                const recentProjectMetaInfo = e.elements!.find(e => e.name === 'value')!
                    .elements!.find(e => e.name === 'RecentProjectMetaInfo')!
                const title = `${recentProjectMetaInfo
                    .attributes!.frameTitle}`.split(' – ')[0] || arg.substring(arg.lastIndexOf('/') + 1);
                return {
                    arg,
                    title,
                    subtitle: arg
                }
            }).reverse()];

        alfy.output(alfy.inputMatches(items, 'title'));
    }
}
