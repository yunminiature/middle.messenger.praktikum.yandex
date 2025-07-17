import Handlebars from 'handlebars';
import Modal from '../Modal/Modal';
import rawContentTemplate from './FileUploadModal.hbs?raw';
import './FileUploadModal.scss';

export interface FileUploadModalProps {
  uploadFn?: (file: File) => Promise<void>;
}

interface FileUploadModalContext {
  showInitial: boolean;
  showLoaded: boolean;
  fileName: string;
}

export default class FileUploadModal {
  private modal: Modal;

  private contentTemplate: HandlebarsTemplateDelegate<FileUploadModalContext>;

  private fileInput: HTMLInputElement;

  private fileName: string;

  private errorText: string;

  private uploadFn?: (file: File) => Promise<void>;

  constructor(props: FileUploadModalProps) {
    this.uploadFn = props.uploadFn;
    this.fileName = '';
    this.errorText = '';

    this.contentTemplate = Handlebars.compile(rawContentTemplate);

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';
    this.fileInput.onchange = () => this.onFileSelected();

    this.modal = new Modal({
      title: 'Загрузите файл',
      content: this.getContentHtml(),
      buttonText: 'Поменять',
      errorText: '',
      onAction: () => this.onReplaceClick(),
    });

    this.modal.getContent().appendChild(this.fileInput);
    this.attachChooseLinkHandler();
  }

  private getContentHtml(): string {
    return this.contentTemplate({
      showInitial: this.fileName === '',
      showLoaded: this.fileName !== '',
      fileName: this.fileName,
    });
  }

  private attachChooseLinkHandler() {
    const chooseButton = this.modal
      .getContent()
      .querySelector<HTMLButtonElement>('[data-id="choose-link"]');
    if (chooseButton) {
      chooseButton.onclick = (e) => {
        e.preventDefault();
        this.fileInput.click();
      };
    }
  }

  private onFileSelected() {
    const files = this.fileInput.files;
    if (!files || files.length === 0) {
      this.errorText = 'Нужно выбрать файл';
      this.updateModal();
      return;
    }
    this.fileName = files[0].name;
    this.errorText = '';
    this.updateModal();
  }

  private onReplaceClick() {
    if (this.fileName === '') {
      this.errorText = 'Нужно выбрать файл';
      this.updateModal();
      return;
    }
    if (this.uploadFn) {
      const file = this.fileInput.files![0];
      this.uploadFn(file)
        .then(() => {
          this.errorText = '';
          this.updateModal();
        })
        .catch(() => {
          this.errorText = 'Ошибка, попробуйте ещё раз';
          this.updateModal();
        });
    } else {
      this.errorText = '';
      this.updateModal();
    }
  }

  private updateModal() {
    const title = this.fileName === '' ? 'Загрузите файл' : 'Файл загружен';
    this.modal.setProps({
      title,
      content: this.getContentHtml(),
      buttonText: 'Поменять',
      errorText: this.errorText,
      onAction: () => this.onReplaceClick(),
    });
    this.modal.getContent().appendChild(this.fileInput);
    this.attachChooseLinkHandler();

    if (typeof (this.modal as Modal & { attachEvents?: () => void }).attachEvents === 'function') {
      (this.modal as Modal & { attachEvents?: () => void }).attachEvents!();
    }
  }

  public show(): void {
    this.modal.show();
  }

  public hide(): void {
    this.modal.hide();
  }

  public getContent(): HTMLElement {
    return this.modal.getContent();
  }
}
