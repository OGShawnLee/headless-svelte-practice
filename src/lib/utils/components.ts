const MASTER_BASE_NAME = 'svelte-headless';

export function createNamer(componentName: string, id: number) {
	const baseName = `${MASTER_BASE_NAME}-${componentName}-${id}`;
	return [
		(subcomponentName: string, id?: number) => {
			if (id) return `${baseName}-${subcomponentName}-${id}`;
			return `${baseName}-${subcomponentName}`;
		},
		baseName,
	] as [namer: (subcomponentName: string, id?: number) => string, baseName: string];
}

export function* idGenerator() {
	let index = 0;
	while (true) yield index++;
}
