import React from 'react';
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';
import { cpfMask } from 'react-input-mask-br';

const TOTAL_LEITOS = 158;
const schema = yup.object().shape({
  nome: yup.string().required('Obrigatório'),
  cpf: yup.string().required('Obrigatório').min(14),
  rg: yup.string().required('Obrigatório'),
  dataNascimento: yup.date().required('Obrigatório'),
  nomeMae: yup.string().required('Obrigatório'),
  leito: yup.number().required('Obrigatório'),
  photo: yup.mixed().nullable(),
});

const ConviventeForm = ({ initialData, occupiedLeitos, onSubmit }) => {
  const initial = initialData ?? {
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    nomeMae: '',
    leito: '',
    photo: null,
    preview: initialData?.photoUrl || '',
  };

  const disponiveis = Array.from({ length: TOTAL_LEITOS }, (_, i) => i + 1)
    .filter(n => !occupiedLeitos.includes(n) || initial.leito === n);

  return (
    <Formik
      initialValues={initial}
      validationSchema={schema}
      enableReinitialize
      onSubmit={(values, actions) => {
        onSubmit(values);
        actions.resetForm();
      }}
    >
      {({ touched, errors, setFieldValue, values }) => (
        <Form className="convivente-form">
          {/* outros campos ... */}

          <div>
            <label>Foto:</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={(e) => {
                const file = e.currentTarget.files[0];
                setFieldValue('photo', file);
                if (file) {
                  setFieldValue('preview', URL.createObjectURL(file));
                }
              }}
            />
            {values.preview && (
              <img
                src={values.preview}
                alt="preview"
                style={{ width: 100, height: 100, objectFit: 'cover', marginTop: 8 }}
              />
            )}
          </div>

          <button type="submit">
            {initialData ? 'Salvar edição' : 'Cadastrar'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default ConviventeForm;

