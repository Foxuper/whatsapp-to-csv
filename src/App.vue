<script setup lang="ts">
	import { ref } from 'vue';

	const delay = ref<number>(100);
	const message = ref<string>('');
	const max_contacts = ref<number>(0);
	const file_name = ref<string>('contactos.csv');
	const save_button = ref<HTMLButtonElement | null>(null);
	const export_button = ref<HTMLButtonElement | null>(null);

	const contact_list: object[] = [];

	async function mainFunction (delay: number, max_contacts: number)
	{
		function time (ms: number)
		{ return new Promise((resolve) => setTimeout(resolve, ms)); }

		function getElement<T extends HTMLElement> (query: string): null | T
		{ return document.querySelector<T>(query); }

		function getTranslateY (element: HTMLElement)
		{
			const translateY = element.style.transform.match(/translateY\(([^)]+)\)/);
			return translateY ? parseInt(translateY[1].split('px')[0]) : 0;
		}

		class Contact
		{
			_position?: number;
			number: string;
			name: string;
			nickname: string;

			constructor (position:number, first_line: string, second_line: string)
			{
				this._position = position;

				if (/^\+[ \d()-]+$/.test(first_line))
				{
					this.number = first_line;
					this.nickname = second_line;
					this.name = '';
				}
				else
				{
					this.number = second_line;
					this.name = first_line;
					this.nickname = '';
				}
			}

			equals (contact: Contact)
			{
				return this.name === contact.name
					&& this.number === contact.number
					&& this.nickname === contact.nickname;
			}
		}

		class MainView
		{
			static triggerMenu ()
			{ getElement('#main > header [data-icon="menu"]')?.click(); }

			static triggerUserInfo ()
			{ getElement('[role="application"] [role="button"]')?.click(); }

			static getFirstLineUserInfo ()
			{
				const first_line = getElement('h2 > div > span');
				return (first_line?.children.length === 0) ? first_line?.innerHTML : undefined;
			}

			static getSecondLineUserInfo ()
			{
				const second_line = getElement('span.selectable-text.copyable-text > span[aria-label]');
				if (second_line?.children.length) return undefined;
				return second_line?.innerHTML || '';
			}
		}

		class PaneSide
		{
			element: HTMLElement;
			previous_scroll_position?: number;

			constructor ()
			{ this.element = getElement('#pane-side') as HTMLElement; }

			atEndOfScroll ()
			{ return this.scroll_position === this.previous_scroll_position; }

			resetScroll ()
			{
				this.previous_scroll_position = undefined;
				this.element.scrollTop = 0;
			}

			scrollDown ()
			{
				this.previous_scroll_position = this.scroll_position;
				this.element.scrollTop += this.element.clientHeight;
			}

			clickListItem (index: number)
			{
				const clickable = this.list_items[index].querySelector('[role="row"] > div');
				clickable?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
			}

			isListItemVisible (index: number)
			{
				const container = this.element.getBoundingClientRect();
				const { bottom, height, top } = this.list_items[index].getBoundingClientRect();
				return top <= container.top ? container.top - top <= height : bottom - container.bottom <= height;
			}

			get scroll_position ()
			{ return this.element.scrollTop + this.element.clientHeight; }

			get list_items ()
			{
				return [...this.element.querySelectorAll<HTMLElement>('[role="listitem"]')]
					.sort((a, b) => getTranslateY(a) - getTranslateY(b));
			}
		}

		const contacts: Contact[] = [];
		function isContactRead (contact: Contact)
		{ return contacts.some((c) => c._position === contact._position); }

		try
		{
			let max_contacts_reached = false;
			const pane_side = new PaneSide();
			const length = pane_side.list_items.length;

			while (!pane_side.atEndOfScroll() && !max_contacts_reached)
			{
				for (let i = 0; i < length; i++)
				{
					if (pane_side.isListItemVisible(i))
					{
						pane_side.clickListItem(i);
						await time(delay);

						MainView.triggerMenu();
						await time(delay);
						MainView.triggerUserInfo();
						await time(delay * 2);

						const first_line = MainView.getFirstLineUserInfo();
						const second_line = MainView.getSecondLineUserInfo();

						if (first_line && second_line !== undefined)
						{
							const position = getTranslateY(pane_side.list_items[i]);
							const contact = new Contact(position, first_line, second_line);

							if (!isContactRead(contact))
								contacts.push(contact);

							if (max_contacts > 0 && contacts.length >= max_contacts)
							{
								max_contacts_reached = true;
								break;
							}
						}
					}
				}

				pane_side.scrollDown();
				await time(delay);
			}
		}
		catch (error)
		{ console.log(error); }

		contacts.forEach((contact) => delete contact._position);
		chrome.runtime.sendMessage({ contacts });
	}

	function runRead ()
	{
		contact_list.length = 0;
		message.value = 'Leyendo contactos...';
		export_button.value?.classList.add('hidden');
		save_button.value?.classList.add('hidden');

		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) =>
		{
			chrome.scripting.executeScript({
				target: { tabId: tabs[0].id as number },
				func: mainFunction as unknown as () => void,
				args: [delay.value, max_contacts.value]
			});
		});
	}

	function objectsToCsvString (data: object[])
	{
		const keys = Object.keys(data[0]);
		const content = data.map((object) =>
			keys.map((key) =>
				`"${object[key as keyof typeof object]}"`).join(',')
		).join('\n');
		return `${keys.join(',')}\n${content}`;
	}

	function runSave ()
	{
		const csv_string = 'data:text/csv;charset=utf-8,' + objectsToCsvString(contact_list);
		const a = document.createElement('a');
		a.download = file_name.value;
		a.href = csv_string;
		a.click();
	}

	chrome.runtime.onMessage.addListener(({ contacts }) =>
	{
		if (contacts.length === 0)
		{
			message.value = 'No se han podido leer los contactos, asegúrate de estar en la pestaña de WhatsApp';
			export_button.value?.classList.remove('hidden');
			save_button.value?.classList.add('hidden');
			return false;
		}

		message.value = 'Se han leído ' + contacts.length + ' contactos';
		export_button.value?.classList.remove('hidden');
		save_button.value?.classList.remove('hidden');
		contact_list.push(...contacts);
		return true;
	});
</script>

<template>
	<div class="card w-96 rounded-none bg-base-100 shadow-xl">
		<div class="card-body p-6">
			<h2 class="card-title">
				WhatsApp a CSV
			</h2>
			<span class="badge badge-primary">por Alonso Ballesteros Torres</span>

			<!-- Instructions -->
			<div class="collapse collapse-arrow mt-2 bg-base-200">
				<input type="checkbox">
				<div class="collapse-title text-lg font-medium">
					Notas de uso
				</div>
				<div class="collapse-content text-sm">
					<ul class="ml-4 list-disc">
						<li>Asegurate de tener seleccionada la pestaña de WhatsApp en tu navegador</li>
						<li>No cambies de pestaña ni cierres la ventana de esta extensión mientras se leen los contactos</li>
						<li>El primer chat visible en la lista será el primero en ser leído, los chats anteriores no serán leídos</li>
						<li>El retardo de interacción es el tiempo que la extensión espera entre cada click simulado en la interfaz</li>
						<li>Si el retardo de interacción es muy bajo, es posible que la interfaz no se actualice lo suficientemente rápido para poder leer todos los contactos</li>
						<li>Si se especifica una cantidad máxima de contactos, la extensión detendrá la lectura al alcanzar ese número</li>
						<li>Una cantidad máxima de contactos de 0 significa que se leerán todos los contactos</li>
						<li>Los chats de empresas y grupos no serán leídos</li>
					</ul>
				</div>
			</div>

			<!-- Settings -->
			<div class="collapse collapse-arrow bg-base-200">
				<input type="checkbox">
				<div class="collapse-title text-lg font-medium">
					Ajustes
				</div>
				<div class="collapse-content">
					<label class="form-control w-full max-w-xs">
						<span class="label label-text">Nombre del archivo</span>
						<input
							v-model="file_name"
							type="text"
							class="input input-bordered w-full"
							placeholder="Nombre del archivo"
						>
					</label>
					<label class="form-control w-full max-w-xs">
						<span class="label label-text">Retardo de interacción (ms)</span>
						<input
							v-model="delay"
							type="number"
							class="input input-bordered w-full"
							placeholder="Retardo de interacción (ms)"
						>
					</label>
					<label class="form-control w-full max-w-xs">
						<span class="label label-text">Cantidad máxima de contactos</span>
						<input
							v-model="max_contacts"
							type="number"
							class="input input-bordered w-full"
							placeholder="Contactos leídos"
						>
					</label>
				</div>
			</div>
			<div class="card-actions mt-2 justify-end">
				<button
					ref="export_button"
					class="btn btn-primary"
					@click="runRead()"
				>
					Leer contactos
				</button>
				<button
					ref="save_button"
					class="btn btn-secondary hidden"
					@click="runSave()"
				>
					Guardar CSV
				</button>
				<p
					v-if="message"
					class="pt-2 text-center text-sm text-primary"
				>
					{{ message }}
				</p>
			</div>
		</div>
	</div>
</template>