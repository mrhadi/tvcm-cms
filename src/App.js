import React from "react";
import Immutable from "immutable";
import { get, post } from 'axios'

import {
  Form,
  Schema,
  Field,
  TextEdit,
  formGroup,
  formList,
  FormEditStates
} from "react-dynamic-forms";

class ContentForm extends React.Component {
  static defaultValues = { order: 1, delay: 5, url: "", caption: "" };

  static schema = (
    <Schema>
      <Field
        name="order"
        label="Order"
        required={false}
        validation={{ type: "integer" }}
      />
      <Field
        name="delay"
        label="Delay(s)"
        required={true}
        validation={{ type: "integer" }}
      />
      <Field
        name="url"
        label="URL"
        required={true}
        validation={{ type: "string", format: "url" }}
      />
      <Field
        name="caption"
        label="Caption"
        required={false}
        validation={{ type: "string" }}
      />
    </Schema>
  );

  render() {
    const {
      onChange,
      onMissingCountChange,
      onErrorCountChange,
      value = ContentForm.defaultValues
    } = this.props;
    const callbacks = { onChange, onMissingCountChange, onErrorCountChange };

    if (this.props.edit) {
      return (
        <Form
          name={this.props.name}
          schema={ContentForm.schema}
          value={value}
          edit={FormEditStates.ALWAYS}
          labelWidth={70}
          {...callbacks}
        >
          <TextEdit field="order" width={40} />
          <TextEdit field="delay" width={40} />
          <TextEdit field="url" width={500} />
          <TextEdit field="caption" width={500} />
        </Form>
      );
    } else {
      return (
        <Form
          name={this.props.name}
          schema={ContentForm.schema}
          value={value}
          edit={FormEditStates.TABLE}
          labelWidth={70}
          {...callbacks}
        >
          <TextEdit field="order" width={40} />
          <TextEdit field="delay" width={40} />
          <TextEdit field="url" width={500} />
          <TextEdit field="caption" width={500} />
        </Form>
      );
    }
  }
}

const ContentList = formList(ContentForm);
const Contents = formGroup(ContentList);

class ContactForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: FormEditStates.ALWAYS,
      hasMissing: false,
      hasErrors: false
    };
  }

  schema() {
    return (
      <Schema>
        <Field name="contents" label="TV Contents" />
      </Schema>
    );
  }

  handleMissingCountChange(form, missingCount) {
    this.setState({ hasMissing: missingCount > 0 });
    if (this.props.onMissingCountChange) {
      this.props.onMissingCountChange(form, missingCount);
    }
  }

  handleErrorCountChange(form, errorCount) {
    this.setState({ hasErrors: errorCount > 0 });
    if (this.props.onErrorCountChange) {
      this.props.onErrorCountChange(form, errorCount);
    }
  }

  handleChange(form, value) {
    if (this.props.onChange) {
      this.props.onChange(form, value);
    }
  }

  handleSubmit(form, value) {
    this.setState({
      //editMode: FormEditStates.SELECTED
    });
    if (this.props.onSubmit) {
      this.props.onSubmit(form, value);
    }
  }

  renderSubmit() {
    let submit;
    if (this.state.editMode === FormEditStates.ALWAYS) {
      let disableSubmit = true;
      let helperText = "";
      if (this.state.hasErrors === false && this.state.hasMissing === false) {
        disableSubmit = false;
      } else {
        helperText =
          this.state.hasErrors === true
            ? "* Unable to save because while form has errors"
            : "* Unable to save because the form has some missing required fields";
      }
      submit = (
        <div>
          <span>
            <button
              type="submit"
              className="btn btn-default"
              disabled={disableSubmit}
              onClick={() => this.handleSubmit()}
            >
              Save Content
            </button>
          </span>
          <span
            style={{
              fontSize: 12,
              paddingLeft: 10,
              color: "orange"
            }}
          >
            {helperText}
          </span>
        </div>
      );
    } else {
      submit = <div>* Make changes to the form by clicking the pencil icons</div>;
    }
    return submit;
  }

  render() {
    const style = { background: "#FAFAFA", padding: 10, borderRadius: 5 };
    const { value } = this.props;
    const contents = value.get("contents");

    return (
      <div className="row">
        <Form
          field="contact-form"
          style={style}
          schema={this.schema()}
          value={value}
          edit={this.state.editMode}
          labelWidth={100}
          onSubmit={() => this.handleSubmit()}
          onChange={(fieldName, value) => this.handleChange(fieldName, value)}
          onMissingCountChange={(form, missing) =>
            this.handleMissingCountChange(form, missing)
          }
          onErrorCountChange={(form, errors) => this.handleErrorCountChange(form, errors)}
        >
          <Contents field="contents" value={contents} />
          <hr />
        </Form>
        <div className="row">
          <div className="col-md-3" />
          <div className="col-md-9">{this.renderSubmit()}</div>
        </div>
      </div>
    );
  }
}


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: false,
      value: new Immutable.fromJS({
        contents: []
      })
    };
    this.getURL = `${window.location.protocol}//tvcm.herokuapp.com/api/contents`;
    this.postURL = `${window.location.protocol}//tvcm.herokuapp.com/api/contents/all`;

    this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleErrorCountChange = this.handleErrorCountChange.bind(this);
    this.handleMissingCountChange = this.handleMissingCountChange.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
  }

  handleResponse(response) {
    this.setState({value: new Immutable.fromJS(response.data)});
  }

  componentWillMount() {
    get(this.getURL)
      .then(this.handleResponse)
      .catch(function (error) {
        console.log(error);
      });
  }

  componentDidMount() {
    // Simulate ASYNC state update
    setTimeout(() => {
      this.setState({ loaded: true });
    }, 0);
  }

  handleChange(form, value) {
    this.setState({ value });
  }

  handleSubmit() {
    const json = this.state.value.toJSON();

    post(this.postURL, {
      contents: json.contents
    })
    .then(function (response) {
      console.log('handleSubmit: ', response);
      window.location.reload();
    })
    .catch(function (error) {
      console.log('handleSubmit: ', error);
    });
  }

  handleMissingCountChange(form, missing) {
    this.setState({ hasMissing: missing > 0 });
  }

  handleErrorCountChange(form, errors) {
    this.setState({ hasErrors: errors > 0 });
  }

  handleAlertDismiss() {
    this.setState({ data: undefined });
  }

  renderContactForm() {
    if (this.state.loaded) {
      return (
        <ContactForm
          value={this.state.value}
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
          onMissingCountChange={this.handleMissingCountChange}
          onErrorCountChange={this.handleErrorCountChange}
        />
      );
    } else {
      return (
        <div style={{ marginTop: 50 }}>
          <b>Loading...</b>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="container">
        <h1 className="text-center">TV Content Management</h1>
        <div className="row">
          <div className="col-md-12">
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-md-8">{this.renderContactForm()}</div>
        </div>
      </div>
    );
  }
}

export default App;
