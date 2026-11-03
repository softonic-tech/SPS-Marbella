import type { ServiceKey } from './i18n/types';

export type ProjectKind = 'newBuild' | 'basement' | 'extension' | 'renovation';
export type ProjectStage = 'before' | 'during' | 'after' | 'photos';

export type ProjectMedia = {
  src: string;
  stage: ProjectStage;
  kind: 'image' | 'video';
};

export type ClientProject = {
  id: string;
  name: string;
  kind: ProjectKind;
  category: ServiceKey;
  cover: string;
  media: readonly ProjectMedia[];
};

/** Client reference projects. Served from public/Reference; homepage imagery is separate. */
export const CLIENT_PROJECTS: readonly ClientProject[] = [
  {
    "id": "danderyd",
    "name": "Danderyd",
    "kind": "newBuild",
    "category": "construction",
    "cover": "/Reference/Danderyd, new build/IMG_6777 - stor.jpeg",
    "media": [
      {
        "src": "/Reference/Danderyd, new build/IMG_3223 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_3250 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_3258 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_5755 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_5803 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_5836 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_5905 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_5914 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_5928 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_6777 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_8353 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      },
      {
        "src": "/Reference/Danderyd, new build/IMG_8355 - stor.jpeg",
        "stage": "photos",
        "kind": "image"
      }
    ]
  },
  {
    "id": "la-resina",
    "name": "La Resina",
    "kind": "basement",
    "category": "interiors",
    "cover": "/Reference/La resina, basement renovation/After/IMG_7667 - stor.jpeg",
    "media": [
      {
        "src": "/Reference/La resina, basement renovation/After/bfe75def-c724-452e-ab35-5e9bca171578 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/D228D731-FC4E-48AB-945B-E22A2D2A96E8 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/IMG_5182 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/IMG_5184 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/IMG_5187 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/IMG_5338 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/IMG_5339 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/IMG_5341 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/IMG_6044 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/Before/IMG_6148 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/After/IMG_7288 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/After/IMG_7289 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/After/IMG_7667 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/La resina, basement renovation/After/IMG_7797 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      }
    ]
  },
  {
    "id": "los-arqueros",
    "name": "Los Arqueros",
    "kind": "extension",
    "category": "construction",
    "cover": "/Reference/Los Arqueros, extension & renovation/During/IMG_9795 - stor.jpeg",
    "media": [
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/5599DD32-CD56-4E14-B4F6-3A8A0676DAEF - stor.jpeg",
        "stage": "during",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/68385551-c08f-4ea2-86ba-4cec2495dd17 - stor.jpeg",
        "stage": "during",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/IMG_0198.MOV",
        "stage": "during",
        "kind": "video"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/Before/IMG_4684 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/Before/IMG_4688 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/Before/IMG_5312 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/Before/IMG_6743 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/IMG_6950 - stor.jpeg",
        "stage": "during",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/IMG_8584 - stor.jpeg",
        "stage": "during",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/IMG_8632 - stor.jpeg",
        "stage": "during",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/IMG_9792 - stor.jpeg",
        "stage": "during",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/IMG_9794 - stor.jpeg",
        "stage": "during",
        "kind": "image"
      },
      {
        "src": "/Reference/Los Arqueros, extension & renovation/During/IMG_9795 - stor.jpeg",
        "stage": "during",
        "kind": "image"
      }
    ]
  },
  {
    "id": "monte-halcones",
    "name": "Monte Halcones",
    "kind": "extension",
    "category": "construction",
    "cover": "/Reference/Monte halcones, extension & renovation/After/9392cebe-6b3a-45fb-b3af-59f0ffe5e9f6.JPG",
    "media": [
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/4934919B-58C2-4AA3-8C0F-9634A872A958 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/580A655C-A555-4E83-B4D1-EE7E96DA494E - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/81FF51AA-6FD6-422C-9787-99EFE9603DD6 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/After/9392cebe-6b3a-45fb-b3af-59f0ffe5e9f6.JPG",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/After/9c807c19-c8ec-40a4-afed-8af8bb417871.JPG",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/After/bd9d8201-9588-47c1-922b-505a2178ad12.JPG",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/After/ca0855fe-d8de-4902-8df0-1b0d3e5cc7ca.JPG",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/After/fb09e53f-e1c7-431f-992d-84b6d2639a56.JPG",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/After/fcd01da0-9e62-415a-8790-ebbb7760249f.JPG",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/IMG_0146 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/IMG_7091 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/IMG_7322 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/IMG_7989 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/IMG_9729 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/IMG_9744 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Monte halcones, extension & renovation/Before/IMG_9885 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      }
    ]
  },
  {
    "id": "nonnas",
    "name": "Nonna's",
    "kind": "renovation",
    "category": "interiors",
    "cover": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1442 - stor.jpeg",
    "media": [
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1438 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1440 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1441 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1442 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1443 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1444 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1445 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1446 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1447 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1448 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1449 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1451 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1452 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1453 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1454 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/After/IMG_1455 - stor.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/Before/IMG_8920 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Nonna┬┤s resturant, renovation/Before/IMG_8921 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      }
    ]
  },
  {
    "id": "spanga",
    "name": "Spånga",
    "kind": "extension",
    "category": "construction",
    "cover": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5005.jpeg",
    "media": [
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/Before/IMG_2717 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/Before/IMG_2865 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/Before/IMG_3030 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/Before/IMG_3274 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/Before/IMG_3524 - stor.jpeg",
        "stage": "before",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5002.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5005.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5036.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5037.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5038.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5039.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5040.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5041.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5042.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5043.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5044.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_5053.jpeg",
        "stage": "after",
        "kind": "image"
      },
      {
        "src": "/Reference/Spa╠ènga, extension & renovation/After/IMG_7735.jpeg",
        "stage": "after",
        "kind": "image"
      }
    ]
  }
];
