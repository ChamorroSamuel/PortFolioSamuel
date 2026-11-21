// Datos personales y de contacto. Lo que esté vacío no se muestra en el sitio.
export const site = {
  name: 'Samuel Chamorro',
  fullName: 'Samuel Rolando Chamorro Torres',
  email: 'theteacher2017@gmail.com',
  github: 'https://github.com/ChamorroSamuel',
  // TODO: pega aquí la URL de tu perfil de LinkedIn
  linkedin: '',
  cv: 'https://drive.google.com/uc?export=download&id=1XN0g-eZbPnd5zy8N72czRVHvNPJBj4Wk',
};

// Orden en que aparecen las tecnologías en el grafo y en la cinta.
export const skills = ['Angular', 'TypeScript', 'Flutter', 'SQL', 'MongoDB', 'Java', 'Python', 'Photoshop'];

export type Bilingual = { es: string; en: string };

// De más reciente a más antiguo.
export const experience: { period: string; title: Bilingual; org: Bilingual; detail?: Bilingual }[] = [
  {
    period: '2020 – 2025',
    title: { es: 'Ingeniería de Software', en: 'Software Engineering degree' },
    org: { es: 'Universidad Peruana de Ciencias Aplicadas (UPC)', en: 'Peruvian University of Applied Sciences (UPC)' },
    detail: {
      es: 'Programación, arquitectura de software, análisis de datos y desarrollo web y móvil. Proyectos de IoT y aplicaciones con IA.',
      en: 'Programming, software architecture, data analysis, and web and mobile development. IoT projects and AI-based apps.',
    },
  },
  {
    period: '2023 – 2024',
    title: { es: 'Art and Science of Machine Learning', en: 'Art and Science of Machine Learning' },
    org: { es: 'Google Cloud', en: 'Google Cloud' },
    detail: {
      es: 'Implementar modelos de machine learning y aplicarlos a casos reales.',
      en: 'Building machine learning models and applying them to real cases.',
    },
  },
  {
    period: '2023 – 2024',
    title: { es: 'Decentralized Applications (Dapps)', en: 'Decentralized Applications (Dapps)' },
    org: { es: 'University at Buffalo', en: 'University at Buffalo' },
    detail: {
      es: 'Contratos inteligentes y aplicaciones descentralizadas sobre blockchain.',
      en: 'Smart contracts and decentralized apps on blockchain.',
    },
  },
  {
    period: '2023 – 2024',
    title: { es: 'Scrum Fundamentals Certified', en: 'Scrum Fundamentals Certified' },
    org: { es: 'SCRUMstudy', en: 'SCRUMstudy' },
    detail: {
      es: 'Gestión ágil de proyectos y entrega incremental.',
      en: 'Agile project management and incremental delivery.',
    },
  },
  {
    period: '2022 – 2023',
    title: { es: 'Learn SQL Basics for Data Science', en: 'Learn SQL Basics for Data Science' },
    org: { es: 'University of California', en: 'University of California' },
    detail: {
      es: 'Manipulación y análisis de grandes volúmenes de datos con SQL.',
      en: 'Handling and analysing large datasets with SQL.',
    },
  },
  {
    period: '2017 – 2018',
    title: { es: 'UI/UX Designer', en: 'UI/UX Designer' },
    org: { es: 'Cambridge University', en: 'Cambridge University' },
    detail: {
      es: 'Diseño de interfaces y experiencias centradas en el usuario.',
      en: 'Interface design and user-centred experiences.',
    },
  },
];
