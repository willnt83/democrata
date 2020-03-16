import React, { Component } from 'react'
import { Layout, Icon, Button, Row, Col, notification, Form, DatePicker } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import ptBr from 'antd/lib/locale-provider/pt_BR'
import moment from 'moment'
import 'moment/locale/pt-br'
moment.locale('pt-br')

const { Content } = Layout


class RelatorioProducoes extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Relatório - Produções Analítico')
    }

    state = {
        reportUrl: null,
        buttonLoading: false
    }

    generateReport = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                this.setState({buttonLoading: true})
                axios
                .get(this.props.backEndPoint + '/reportProducoesAnalitico?dataInicial='+values.dataInicial.format('YYYY-MM-DD')+'&dataFinal='+values.dataFinal.format('YYYY-MM-DD'))
                .then(res => {
                    if(res.data.success){
                        this.setState({reportUrl: res.data.payload.url, buttonLoading: false})
                        this.showNotification(res.data.msg, true)
                    }
                })
                .catch(error => {
                    console.log(error)
                    this.setState({buttonLoading: false})
                })
            }
        })
    }

    resetButton = () => {
        this.setState({reportUrl: null})
    }

    showNotification = (msg, success) => {
        var type = null
        var style = null
        if(success){
            type = 'check-circle'
            style = {color: '#4ac955', fontWeight: '800'}
        }
        else {
            type = 'exclamation-circle'
            style = {color: '#f5222d', fontWeight: '800'}
        }
        const args = {
            message: msg,
            icon:  <Icon type={type} style={style} />,
            duration: 1
        }
        notification.open(args)
    }

    render(){
        const { getFieldDecorator } = this.props.form
        const buttonReport = this.state.reportUrl === null ?
            <Button className="buttonGreen" onClick={this.generateReport} loading={this.state.buttonLoading}><Icon type="bar-chart" /> Gerar Relatório</Button>
            :
            <a href={this.state.reportUrl}><Button className="buttonOrange" onClick={this.resetButton}><Icon type="download" /> Baixar Relatório</Button></a>
        return(
            <Content
                style={{
                    margin: "24px 16px",
                    padding: 24,
                    background: "#fff",
                    minHeight: 280
                }}
            >
                <Row>
                    <Col span={24} id="colFiltroData" style={{position: 'relative'}}>
                        <Form layout="vertical">
                            <Form.Item
                                label="Data Inicial"
                            >
                                {getFieldDecorator('dataInicial', {
                                    rules: [{ required: true, message: 'Campo Data Inicial obrigatório' }]
                                })(
                                    <DatePicker
                                        locale={ptBr}
                                        format="DD/MM/YYYY"
                                        placeholder="Selecione a data inicial"
                                        style={ {width: '100%'} }
                                        getCalendarContainer={() => document.getElementById('colFiltroData')}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item
                                label="Data Final"
                            >
                                {getFieldDecorator('dataFinal', {
                                    rules: [{ required: true, message: 'Campo Data Final obrigatório' }]
                                })(
                                    <DatePicker
                                        locale={ptBr}
                                        format="DD/MM/YYYY"
                                        placeholder="Selecione a data final"
                                        style={ {width: '100%'} }
                                        getCalendarContainer={() => document.getElementById('colFiltroData')}
                                    />
                                )}
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>

                <Row style={{ marginBottom: 16 }}>
                    <Col span={24} align="middle">
                        {buttonReport}
                    </Col>
                </Row>
          </Content>
        )
    }
}

const MapStateToProps = (state) => {
	return {
        backEndPoint: state.backEndPoint
	}
}

const mapDispatchToProps = (dispatch) => {
    return {
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(RelatorioProducoes))