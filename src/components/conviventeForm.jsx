import React from 'react';
import { Formik, Field, Form} from 'formik';
import * as yup from 'yup';
import { cpfMask} from 'react-input-mask-br';


const TOTAL_LEITOS = 158;
const schema = yup.object().shape({
  nome: yup.string().required(),
  cpf: yup.string().required().min(14),
  rg: yup.string().required(),
  dataNascimento: yup.date().required(),
  nomeMae: yup.string().required(),
  leito: yup.number().required(),
});

const ConviventeForm = ({ initialData, occupiedLeitos, onSubmit }) => {
  const initial = initialData ?? {
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    nomeMae: '',
    leito: '',
  };
  const disponiveis = Array.from({ length: TOTAL_LEITOS }, (_, i) => i + 1)
    .filter(n => !occupiedLeitos.includes(n) || (initial.leito === n));

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
      {({ touched, errors, setFieldValue }) => (
        <Form className="convivente-form">
          {['nome','cpf','rg','dataNascimento','nomeMae'].map(field => (
            <div key={field}>
              <label>{field === 'nomeMae' ? 'Nome da Mãe' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <Field name={field}>
                {({ field: f }) => {
                  if (field === 'cpf' || field === 'rg')
                    return <input {...f} onChange={e => {
                      const v = field==='cpf' ? cpfMask(e.target.value) : e.target.value;
                      setFieldValue(field, v);
                    }}/>;
                  if (field === 'dataNascimento')
                    return <input {...f} type="date"/>;
                  return <input {...f}/>;
                }}
              </Field>
              {touched[field] && errors[field] && <div className="error">{errors[field]}</div>}
            </div>
          ))}
          <div>
            <label>Leito</label>
            <Field as="select" name="leito">
              <option value="">Selecione...</option>
              {disponiveis.map(n => <option key={n} value={n}>{n}</option>)}
            </Field>
            {touched.leito && errors.leito && <div className="error">{errors.leito}</div>}
          </div>
          <button type="submit">{initialData ? 'Salvar edição' : 'Cadastrar'}</button>
        </Form>
      )}
    </Formik>
  );
};

export default ConviventeForm;
