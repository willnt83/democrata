import React, { Component } from 'react'
import { Row, Col, Form, Modal, Select, Icon, notification, Button } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import { withRouter } from "react-router-dom"
import moment from 'moment'
import BarcodeReader from 'react-barcode-reader'

class LancamentoProducao extends Component{
    constructor(props){
        super(props)
        this.state = {
            
        }
        this.handleScan = this.handleScan.bind(this)
    }

    handleScan(data){
        console.log('scan', data)
        var request = {
            barcode: data
        }
        this.requestLancamentoProducao(request)
    }

    handleError(err){
        console.error(err)
    }

    requestLancamentoProducao = (request) => {
        axios
        .post(this.props.backEndPoint + '/lancamentoCodigoDeBarras', request)
        .then(res => {
            console.log('response', res)
            if(res.data.success){
                
            }
            else{
                
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    render(){
        const { getFieldDecorator } = this.props.form
        return(
            <Modal
                title="Lançamento de Produção"
                visible={this.props.showModalLancamentoProducao}
                onCancel={() => this.props.showModalLancamentoProducaoF(false)}
                footer={[
                    <Button key="back" onClick={() => this.props.showModalLancamentoProducaoF(false)}><Icon type="close" /> Cancelar</Button>,
                    <Button key="submit" type="primary" loading={this.state.buttonSalvarProducaoLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                ]}
                width={900}
                onKeyUp={this.keyUpHandler}
            >
                <Row>
                    <Col span={24} id="colLancamentoProducao" style={{position: 'relative'}}>
                        <BarcodeReader
                            onError={this.handleError}
                            onScan={this.handleScan}
                        />
                        <Form layout="vertical">
                            <Form.Item label="Funcionário">
                                {getFieldDecorator('ativo', {
                                    rules: [
                                        {
                                            required: true, message: 'Por favor selecione',
                                        }
                                    ]
                                })(
                                    <Select
                                        style={{ width: '100%' }}
                                        placeholder="Selecione"
                                        getPopupContainer={() => document.getElementById('colLancamentoProducao')}
                                        allowClear={true}
                                    >
                                        {
                                            this.props.funcionariosOptions.map((option) => {
                                                return (<Select.Option key={option.value} value={option.value}>{option.description}</Select.Option>)
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        </Form>

                    </Col>
                </Row>
            </Modal>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint,
        producaoAcompanhamento: state.producaoAcompanhamento,
        producaoMainData: state.producaoMainData
	}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(withRouter(LancamentoProducao)))