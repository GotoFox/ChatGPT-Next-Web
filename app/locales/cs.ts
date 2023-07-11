import { SubmitKey } from "../store/config";
import type { PartialLocaleType } from "./index";

const cs: PartialLocaleType = {
  WIP: "V přípravě...",
  Error: {
    Unauthorized:
      "Neoprávněný přístup, zadejte přístupový kód na stránce nastavení.",
  },
  ChatItem: {
    ChatItemCount: (count: number) => `${count} zpráv`,
  },
  Chat: {
    SubTitle: (count: number) => `${count} zpráv s ChatGPT`,
    Actions: {
      ChatList: "Přejít na seznam chatů",
      CompressedHistory: "Pokyn z komprimované paměti historie",
      Export: "Exportovat všechny zprávy jako Markdown",
      Copy: "Kopírovat",
      Stop: "Zastavit",
      Retry: "Zopakovat",
      Delete: "Smazat",
    },
    Rename: "Přejmenovat chat",
    Typing: "Píše...",
    Input: (submitKey: string) => {
      var inputHints = `${submitKey} pro odeslání`;
      if (submitKey === String(SubmitKey.Enter)) {
        inputHints += ", Shift + Enter pro řádkování";
      }
      return inputHints + ", / pro vyhledávání pokynů";
    },
    Send: "Odeslat",
    Config: {
      Reset: "Obnovit výchozí",
      SaveAs: "Uložit jako Masku",
    },
  },
  Export: {
    Title: "Všechny zprávy",
    Copy: "Kopírovat vše",
    Download: "Stáhnout",
    MessageFromYou: "Zpráva od vás",
    MessageFromChatGPT: "Zpráva z ChatGPT",
  },
  Memory: {
    Title: "Pokyn z paměti",
    EmptyContent: "Zatím nic.",
    Send: "Odeslat paměť",
    Copy: "Kopírovat paměť",
    Reset: "Obnovit relaci",
    ResetConfirm:
      "Resetováním se vymaže historie aktuálních konverzací i paměť historie pokynů. Opravdu chcete provést obnovu?",
  },
  Home: {
    NewChat: "Nový chat",
    DeleteChat: "Potvrzujete smazání vybrané konverzace?",
    DeleteToast: "Chat smazán",
    Revert: "Zvrátit",
  },
  Settings: {
    Title: "Nastavení",
    SubTitle: "Všechna nastavení",

    Lang: {
      Name: "Language", // ATTENTION: if you wanna add a new translation, please do not translate this value, leave it as `Language`
      All: "Všechny jazyky",
    },
    Avatar: "Avatar",
    FontSize: {
      Title: "Velikost písma",
      SubTitle: "Nastavení velikosti písma obsahu chatu",
    },
    InjectSystemPrompts: {
      Title: "Vložit systémové prompty",
      SubTitle:
        "Vynutit přidání simulovaného systémového promptu ChatGPT na začátek seznamu zpráv každého požadavku",
    },
    Update: {
      Version: (x: string) => `Verze: ${x}`,
      IsLatest: "Aktuální verze",
      CheckUpdate: "Zkontrolovat aktualizace",
      IsChecking: "Kontrola aktualizace...",
      FoundUpdate: (x: string) => `Nalezena nová verze: ${x}`,
      GoToUpdate: "Aktualizovat",
    },
    SendKey: "Odeslat klíč",
    Theme: "Téma",
    TightBorder: "Těsné ohraničení",
    SendPreviewBubble: {
      Title: "Odesílat chatovací bublinu s náhledem",
      SubTitle: "Zobrazit v náhledu bubliny",
    },
    Mask: {
      Splash: {
        Title: "Úvodní obrazovka Masek",
        SubTitle: "Před zahájením nového chatu zobrazte úvodní obrazovku Masek",
      },
    },
    Prompt: {
      Disable: {
        Title: "Deaktivovat automatické dokončování",
        SubTitle: "Zadejte / pro spuštění automatického dokončování",
      },
      List: "Seznam pokynů",
      ListCount: (builtin: number, custom: number) =>
        `${builtin} vestavěných, ${custom} uživatelských`,
      Edit: "Upravit",
      Modal: {
        Title: "Seznam pokynů",
        Add: "Přidat pokyn",
        Search: "Hledat pokyny",
      },
      EditModal: {
        Title: "Editovat pokyn",
      },
    },
    HistoryCount: {
      Title: "Počet připojených zpráv",
      SubTitle: "Počet odeslaných připojených zpráv na žádost",
    },
    CompressThreshold: {
      Title: "Práh pro kompresi historie",
      SubTitle:
        "Komprese proběhne, pokud délka nekomprimovaných zpráv přesáhne tuto hodnotu",
    },
    Token: {
      Title: "API klíč",
      SubTitle: "Použitím klíče ignorujete omezení přístupového kódu",
      Placeholder: "Klíč API OpenAI",
    },
    Usage: {
      Title: "Stav účtu",
      SubTitle(used: any, total: any) {
        return `Použito tento měsíc $${used}, předplaceno $${total}`;
      },
      IsChecking: "Kontroluji...",
      Check: "Zkontrolovat",
      NoAccess: "Pro kontrolu zůstatku zadejte klíč API",
    },
    AccessCode: {
      Title: "Přístupový kód",
      SubTitle: "Kontrola přístupu povolena",
      Placeholder: "Potřebujete přístupový kód",
    },
    Model: "Model",
    Temperature: {
      Title: "Teplota",
      SubTitle: "Větší hodnota činí výstup náhodnějším",
    },
    MaxTokens: {
      Title: "Max. počet tokenů",
      SubTitle: "Maximální délka vstupního tokenu a generovaných tokenů",
    },
    PresencePenalty: {
      Title: "Přítomnostní korekce",
      SubTitle: "Větší hodnota zvyšuje pravděpodobnost nových témat.",
    },
    FrequencyPenalty: {
      Title: "Frekvenční penalizace",
      SubTitle:
        "Větší hodnota snižující pravděpodobnost opakování stejného řádku",
    },
  },
  Store: {
    DefaultTopic: "Nová konverzace",
    BotHello: "Ahoj! Jak mohu dnes pomoci?",
    Error: "Něco se pokazilo, zkuste to prosím později.",
    Prompt: {
      History: (content: string) =>
        "Toto je shrnutí historie chatu mezi umělou inteligencí a uživatelem v podobě rekapitulace: " +
        content,
      Topic:
        "Vytvořte prosím název o čtyřech až pěti slovech vystihující průběh našeho rozhovoru bez jakýchkoli úvodních slov, interpunkčních znamének, uvozovek, teček, symbolů nebo dalšího textu. Odstraňte uvozovky.",
      Summarize:
        "Krátce shrň naši diskusi v rozsahu do 200 slov a použij ji jako podnět pro budoucí kontext.",
    },
  },
  Copy: {
    Success: "Zkopírováno do schránky",
    Failed: "Kopírování selhalo, prosím, povolte přístup ke schránce",
  },
  Context: {
    Toast: (x: any) => `Použití ${x} kontextových pokynů`,
    Edit: "Kontextové a paměťové pokyny",
    Add: "Přidat pokyn",
  },
  Plugin: {
    Name: "Plugin",
  },
  Mask: {
    Name: "Maska",
    Page: {
      Title: "Šablona pokynu",
      SubTitle: (count: number) => `${count} šablon pokynů`,
      Search: "Hledat v šablonách",
      Create: "Vytvořit",
    },
    Item: {
      Info: (count: number) => `${count} pokynů`,
      Chat: "Chat",
      View: "Zobrazit",
      Edit: "Upravit",
      Delete: "Smazat",
      DeleteConfirm: "Potvrdit smazání?",
    },
    EditModal: {
      Title: (readonly: boolean) =>
        `Editovat šablonu pokynu ${readonly ? "(pouze ke čtení)" : ""}`,
      Download: "Stáhnout",
      Clone: "Duplikovat",
    },
    Config: {
      Avatar: "Avatar Bota",
      Name: "Jméno Bota",
    },
  },
  NewChat: {
    Return: "Zpět",
    Skip: "Přeskočit",
    Title: "Vyberte Masku",
    SubTitle: "Chatovat s duší za Maskou",
    More: "Najít více",
    NotShow: "Nezobrazovat znovu",
    ConfirmNoShow: "Potvrdit zakázání？Můžete jej povolit později v nastavení.",
  },

  UI: {
    Confirm: "Potvrdit",
    Cancel: "Zrušit",
    Close: "Zavřít",
    Create: "Vytvořit",
    Edit: "Upravit",
  },
  authModel: {
    register: "Registrace",
    login: "Přihlásit se",
    signUpNow: "Zaregistrujte se nyní",
    logInNow: "Přihlaste se nyní",
    cancel: "Zrušit",
    userName: "Uživatelské jméno",
    password: "Heslo",
    email: "Email",
    invitationCode: "Pozvánkový kód",
    noUser: "Nemáte účet? Zaregistrujte se zde >>",
    yesUser: "Máte již účet? Přihlaste se zde >>",
    rememberPsd: "Zapamatovat si heslo",
    getAnInvitationCode: "Získejte pozvánkový kód",
    Toast: {
      upCannotBeEmpty: "Uživatelské jméno a heslo nesmí být prázdné",
      uepCannotBeEmpty: "Uživatelské jméno, email a heslo nesmí být prázdné",
      invitationCodeCannotBeEmpty: "Pozvánkový kód nesmí být prázdný",
      usernameRestrictions:
        "Uživatelské jméno může obsahovat pouze písmena a číslice a maximální délka je 30 znaků",
      emailVerification: "Prosím, zadejte správný email",
      pleaseEnterUe: "Prosím, zadejte uživatelské jméno/email",
      pleaseEnterPwd: "Zadejte prosím heslo",
      pleaseEnterUser: "Prosím, zadejte uživatelské jméno",
      pleaseEnterEmail: "Zadejte e-mailovou adresu",
      pleaseEnterInvitationCode: "Prosím, zadejte pozvánkový kód",
      getAnInvitationCode:
        "Funkce pozvánkového kódu byla spuštěna, ale během interního testování stále existují mnoho neznámých faktorů, veřejný pozvánkový kód nebyl zveřejněn v testovacím prostředí Prosím, použijte pozvánkový kód vygenerovaný jiným registrovaným uživatelem.",
      error: "Chyba sítě, zkuste to znovu",
    },
  },
  Exporter: {
    Model: "Model",
    Messages: "Zprávy",
    Topic: "Téma",
    Time: "Čas",
  },
};

export default cs;
