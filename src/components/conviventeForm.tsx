import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as yup from 'yup';

// Define a interface dos dados do formulário
interface ConviventeFormData {
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  nomeMae: string;
  leito: number | '';
  photo: File | null;
  preview?: string;
}

// Props esperadas pelo componente
interface ConviventeFormProps {
  initialData?: Partial<ConviventeFormData>;
  occupiedLeitos?: number[];
  onSubmit: (values: ConviventeFormData) => void;
}

// Schema de validação com Yup
const schema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório'),
  cpf: yup.string().required('CPF é obrigatório').min(14, 'CPF inválido'),
  rg: yup.string().required('RG é obrigatório'),
  dataNascimento: yup.date().required('Data de nascimento é obrigatória'),
  nomeMae: yup.string().required('Nome da mãe é obrigatório'),
  leito: yup
    .number()
    .typeError('Leito deve ser um número')
    .required('Leito é obrigatório'),
  photo: yup.mixed().nullable(),
});

const ConviventeForm: React.FC<ConviventeFormProps> = ({
  initialData,
  occupiedLeitos,
  onSubmit,
}) => {
  const [preview, setPreview] = useState<string | undefined>(initialData?.preview);

  useEffect(() => {
    if (initialData?.photo) {
      setPreview(URL.createObjectURL(initialData.photo));
    }
  }, [initialData?.photo]);

  const initialValues: ConviventeFormData = {
    nome: initialData?.nome || '',
    cpf: initialData?.cpf || '',
    rg: initialData?.rg || '',
    dataNascimento: initialData?.dataNascimento || '',
    nomeMae: initialData?.nomeMae || '',
    leito: initialData?.leito ?? '',
    photo: initialData?.photo ?? null,
    preview: initialData?.preview || '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      enableReinitialize
      onSubmit={(values: ConviventeFormData, actions: FormikHelpers<ConviventeFormData>) => {
        onSubmit(values);
        actions.resetForm();
      }}
    >
      {({ setFieldValue, values }) => (
        <Form className="convivente-form">
          <div>
            <label htmlFor="nome">Nome:</label>
            <Field
              id="nome"
              name="nome"
              type="text"
              className="input"
            />
            <ErrorMessage name="nome" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="cpf">CPF:</label>
            <Field
              id="cpf"
              name="cpf"
              type="text"
              className="input"
            />
            <ErrorMessage name="cpf" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="rg">RG:</label>
            <Field
              id="rg"
              name="rg"
              type="text"
              className="input"
            />
            <ErrorMessage name="rg" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="dataNascimento">Data de Nascimento:</label>
            <Field
              id="dataNascimento"
              name="dataNascimento"
              type="date"
              className="input"
            />
            <ErrorMessage name="dataNascimento" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="nomeMae">Nome da Mãe:</label>
            <Field
              id="nomeMae"
              name="nomeMae"
              type="text"
              className="input"
            />
            <ErrorMessage name="nomeMae" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="leito">Leito:</label>
            <Field
              id="leito"
              name="leito"
              type="number"
              className="input"
            />
            <ErrorMessage name="leito" component="div" className="error" />
          </div>

          <div>
            <label htmlFor="photo">Foto:</label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.currentTarget.files ? e.currentTarget.files[0] : null;
                setFieldValue('photo', file);
                if (file) {
                  setPreview(URL.createObjectURL(file));
                  setFieldValue('preview', URL.createObjectURL(file));
                }
              }}
              className="input"
            />
            {preview && (
              <div>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 8 }}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn">
            {initialData ? 'Salvar edição' : 'Cadastrar'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ConviventeForm;
