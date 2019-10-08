import React, { Component } from 'react'
import { Divider, Icon, Modal, Button, Row, Col, Form, Select, Input, InputNumber, DatePicker, TimePicker, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'

let id = 0

class ModalEntrada extends Component {
    constructor(props) {
        super()
    }

    state = {
        
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        
        return(
            <React.Fragment>
                <Modal
                    title="Entrada de Produtos Finalizados"
                    visible={this.props.showModalEntrada}
                    onCancel={() => this.props.showModalEntradaF(false)}
                    width='90%'
                    style={{minWidth:'600px'}}
                    footer={[
                        <Button key="back" onClick={() => this.props.showModalEntradaF(false)}><Icon type="close" /> Cancelar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    {
                        <Row>
                            <Col span={24}>
                                Aguardando bip de entrada...
                            </Col>
                        </Row>

                    }
                </Modal>
            </React.Fragment>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        session: state.session
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ModalEntrada))