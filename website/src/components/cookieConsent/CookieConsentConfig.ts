import type { CookieConsentConfig } from 'vanilla-cookieconsent';

export const config: CookieConsentConfig = {

    guiOptions: {
        consentModal: {
            layout: "box",
            position: "bottom right",
            equalWeightButtons: false,
            flipButtons: false
        },
        preferencesModal: {
            layout: "bar",
            position: "right",
            equalWeightButtons: false,
            flipButtons: false
        }
    },
    categories: {
        necessary: {
            readOnly: true
        },
        functionality: {}
    },
    language: {
        default: "de",
        translations: {
            de: {
                consentModal: {
                    title: "Hallo Reisende, es ist Kekszeit!",
                    description: "Wir verwenden Cookies und ähnliche Technologien auf unserer Website und verarbeiten personenbezogene Daten über dich, wie deine IP-Adresse. Wir teilen diese Daten auch mit Dritten. Die Datenverarbeitung kann mit deiner Einwilligung oder auf Basis eines berechtigten Interesses erfolgen, dem du in den individuellen Datenschutzeinstellungen widersprechen kannst.",
                    acceptAllBtn: "Alle akzeptieren",
                    acceptNecessaryBtn: "Alle ablehnen",
                    showPreferencesBtn: "Einstellungen verwalten",
                    footer: "<a href=\"/data-privacy\">Datenschutz</a>\n<a href=\"/legal-notice\">Impressum</a>"
                },
                preferencesModal: {
                    title: "Präferenzen für die Zustimmung",
                    acceptAllBtn: "Alle akzeptieren",
                    acceptNecessaryBtn: "Alle ablehnen",
                    savePreferencesBtn: "Einstellungen speichern",
                    closeIconLabel: "Modal schließen",
                    serviceCounterLabel: "Dienstleistungen",
                    sections: [
                        {
                            title: "Verwendung von Cookies",
                            description: "Wir verwenden Cookies und ähnliche Technologien auf unserer Website und verarbeiten personenbezogene Daten über dich, wie deine IP-Adresse. Wir teilen diese Daten auch mit Dritten. Die Datenverarbeitung kann mit deiner Einwilligung oder auf Basis eines berechtigten Interesses erfolgen, dem du in den individuellen Datenschutzeinstellungen widersprechen kannst."
                        },
                        {
                            title: "Streng Notwendige Cookies <span class=\"pm__badge\">Immer Aktiviert</span>",
                            description: "Bisher verwenden wir keine Cookies die streng notwendig sind.",
                            linkedCategory: "necessary"
                        },
                        {
                            title: "Funktionalitäts Cookies",
                            description: "Funktionalitäts Cookies sind notwendig, um über die wesentliche Funktionalität der Website hinausgehende Features bereitzustellen. Inhalte von z.B. Video- und Social Media-Plattformen sind standardmäßig gesperrt und können zugestimmt werden. Wenn dem Service zugestimmt wird, werden diese Inhalte automatisch ohne weitere manuelle Einwilligung geladen.",
                            linkedCategory: "functionality"
                        },
                        {
                            title: "Weitere Informationen",
                            description: "Einige Services verarbeiten personenbezogene Daten in den USA. Indem du der Nutzung dieser Services zustimmst, erklärst du dich auch mit der Verarbeitung deiner Daten in den USA gemäß Art. 49 (1) lit. a DSGVO einverstanden. Die USA werden vom EuGH als ein Land mit einem unzureichenden Datenschutzniveau nach EU-Standards angesehen. Insbesondere besteht das Risiko, dass deine Daten von US-Behörden zu Kontroll- und Überwachungszwecken verarbeitet werden, unter Umständen ohne die Möglichkeit eines Rechtsbehelfs. Du bist unter 16 Jahre alt? Dann kannst du nicht in optionale Services einwilligen, oder du kannst deine Eltern oder Erziehungsberechtigten bitten, mit dir in diese Services einzuwilligen.<br/>Für alle Fragen zu unserer Richtlinie zu Cookies und deinen Wahlmöglichkeiten <a class=\"cc__link\" href=\"/contact\">kontaktiere</a> uns bitte."
                        }
                    ]
                }
            }
        },
        autoDetect: "browser"
    }
};