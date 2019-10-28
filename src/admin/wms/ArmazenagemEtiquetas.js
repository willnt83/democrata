import React, { Component } from 'react'
import { Icon, Modal, Button, Row, Col, Form, Input } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"


class ArmazenagemEtiquetas extends Component {
    constructor(props) {
        super()
    }

    state = {
        showArmazenagemEtiquetas: false,
        insumosArmazenados: [],
        dynamicFieldsRendered: false,
        btnGerarEtiquetas: false
    }

    compareByAlph = (a, b) => {
        if (a > b)
            return -1
        if (a < b)
            return 1
        return 0
    }

    requestGetInsumosArmazenados = (idArmazenagem) => {
        axios
        .get(this.props.backEndPoint + '/getInsumosArmazenados?id_armazenagem='+idArmazenagem)
        .then(res => {
            if(res.data.payload){
                this.setState({
                    dynamicFieldsRendered: true,
                    insumosArmazenados: res.data.payload.map(insumo => {
                        return({
                            idInsumo: insumo.insumo.id,
                            codigo: insumo.insumo.ins,
                            nome: insumo.insumo.nome,
                            idAlmoxarifado: insumo.insumo.idAlmoxarifado,
                            idPosicao: insumo.insumo.idPosicao,
                            localFisico: insumo.insumo.nomeAlmoxarifado+' - '+insumo.insumo.nomePosicao,
                            dataRecebimento: insumo.insumo.dataRecebimento,
                            quantidade: insumo.insumo.quantidade,
                            unidadeMedida: insumo.insumo.unidadeMedida
                        })
                    })
                })
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGeracaoEtiquetasArmazenagem = (request) => {
        axios.post(this.props.backEndPoint + '/geracaoEtiquetasArmazenagem', request)
        .then(res => {
            this.setState({btnGerarEtiquetas: false})
            window.open(this.props.backEndPoint + '/' + res.data.payload.url, '_blank');
        })
        .catch(error =>{
            this.setState({btnGerarEtiquetas: false})
            console.log(error)
        })
    }

    handleFormSubmit = () => {
        this.setState({btnGerarEtiquetas: true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                var request = []
                values.quantidadeEtiquetas.forEach((qtd, index) => {
                    request.push({
                        ...this.state.insumosArmazenados[index],
                        quantidadeEtiquetas: qtd
                    })
                })
                this.requestGeracaoEtiquetasArmazenagem(request)
            }
            else
                console.log('Erro na geração de etiquetas.')
        })
    }

    componentDidUpdate(prevProps, prevState){
        // Evento: Modal aberto
        if(!prevProps.showArmazenagemEtiquetasModal && this.props.showArmazenagemEtiquetasModal){
            // Edit
            this.requestGetInsumosArmazenados(this.props.idArmazenagem)
        }
    }

    render(){
        const { getFieldDecorator } = this.props.form

        return(
            <React.Fragment>
                <Modal
                    title="Geração de Etiquetas de Armazenagem"
                    visible={this.props.showArmazenagemEtiquetasModal}
                    onCancel={() => this.props.showArmazenagemEtiquetasModalF(false)}
                    width={1300}
                    footer={[
                        <Button key="back" onClick={() => this.props.showArmazenagemEtiquetasModalF(false)}><Icon type="close" /> Fechar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnGerarEtiquetas} onClick={() => this.handleFormSubmit()}><Icon type="barcode" /> Gerar Etiquetas</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} style={{position: 'relative'}}>
                            <Form layout="vertical">
                                
                                {
                                    this.state.insumosArmazenados.length > 0 ?
                                    <React.Fragment>
                                        <Row className="bold" style={{marginBottom: 15}}>
                                            <Col span={4}>ID</Col>
                                            <Col span={5}>Insumo</Col>
                                            <Col span={6}>Localização</Col>
                                            <Col span={5}>Qde. Armazenada</Col>
                                            <Col span={4}>Qde. de Etiquetas</Col>
                                        </Row>
                                        {
                                            this.state.insumosArmazenados.map((insumo, k) =>{
                                                return(
                                                    <Row className="mt20" key={insumo.idInsumo}>
                                                        <Col span={4}>{insumo.idInsumo}</Col>
                                                        <Col span={5}>{insumo.nome} ({insumo.codigo})</Col>
                                                        <Col span={6}>{insumo.localFisico}</Col>
                                                        <Col span={5}>{insumo.quantidade}</Col>
                                                        <Col span={4}>
                                                            <Form.Item style={{marginBottom: 0}}>
                                                                {getFieldDecorator(`quantidadeEtiquetas[${k}]`, {
                                                                    rules: [{
                                                                        required: true, message: "Informe a quantidade"
                                                                    }],
                                                                })(
                                                                    <Input
                                                                        style={{ width: '75%', marginRight: 8 }}
                                                                        placeholder="Qtd"
                                                                    />
                                                                )}
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>
                                                )
                                            })
                                        }
                                    </React.Fragment>
                                    : null
                                }
                                
                            </Form>
                        </Col>
                    </Row>
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
    return {
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(ArmazenagemEtiquetas))