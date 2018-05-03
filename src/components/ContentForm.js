import React from 'react'
import { Field, reduxForm } from 'redux-form';

const ContentForm = props => {
  const { handleSubmit, pristine, reset, submitting } = props;
  return (
    <form onSubmit={handleSubmit}>
      <ul id="columns">
        <li className="column">
          <div className="row form-group">
            <div className="col-sm-2">
              <label>Order</label>
              <div>
                <Field
                  name="order"
                  component="input"
                  type="number"
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-sm-6">
              <label>URL</label>
              <div>
                <Field
                  name="url"
                  component="input"
                  type="text"
                  placeholder=""
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-sm-2">
              <label>Delay (sec)</label>
              <div>
                <Field
                  name="delay"
                  component="input"
                  type="text"
                  placeholder=""
                  className="form-control"
                />
              </div>
            </div>
            <div className="col-sm-2">
              <button type="submit" disabled={pristine || submitting}>Submit</button>
            </div>
          </div>
        </li>
        <li>
          <a href="#" className="add">+ Add new</a>
        </li>
      </ul>
    </form>
  );
};

export default reduxForm({
  form: 'contents',
})(ContentForm);