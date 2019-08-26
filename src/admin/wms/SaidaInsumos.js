import React, { Component } from 'react'
import { Icon, Modal, Button, Row, Col, Form, Select, Input, notification } from 'antd'
import { connect } from 'react-redux'
import axios from "axios"
import cloneDeep from 'lodash/cloneDeep';

import SaidaBarCode from './SaidaBarCode'

let id = 0

class SaidaInsumos extends Component {
    constructor(props) {
        super()
        props.setPageTitle('Saída de Insumos')
    }

    state = {
        showSaidaLancamentoModal: false,
        insumos: [],
        insumosOptions: [],
        insumosInfo: [],
        dynamicFieldsRendered: false,
        almoxarifados: [],
        quantidades: [],
        btnSalvarLoading: false,
        showSaidaBarCode: false,
        insumosData: [],
        insertingInsumoData: false,
        insumosRetirados: []        
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
            duration: 3
        }
        notification.open(args)
    }

    returnInsumosInsertedF = () => {
        return this.props.form.getFieldValue('insumo')
    }

    insertSaidaInsumoF = (insumosData) => {
        if(insumosData && insumosData.length > 0){
            var key = id;
            insumosData = insumosData.map(insumo => {
                this.addComposicaoRow()
                return {
                    ...insumo,
                    index: key++
                }
            })
            this.setState({insertingInsumoData: true, insumosData: insumosData})
        }
    }

    showSaidaBarCodeF = (showSaidaBarCode) => {
       this.setState({showSaidaBarCode})
    }

    requestGetInsumosDisponiveisParaSaida = () => {
        axios
        .get(this.props.backEndPoint + '/getInsumosDisponiveisParaSaida')
        .then(res => {
            if(res.data.payload){
                var insumosOptions = res.data.payload.map(insumo => {
                    return({
                        id: insumo.idArmazenagemInsumo,
                        idPedidoInsumo: insumo.idPedidoInsumo,
                        nomeInsumo: insumo.nomeInsumo,
                        idAlmoxarifado: insumo.idAlmoxarifado,
                        nomeAlmoxarifado: insumo.nomeAlmoxarifado,
                        idPosicao: insumo.idPosicao,
                        nomePosicao: insumo.nomePosicao,
                        quantidadeDisponivel: parseFloat(insumo.quantidadeDisponivel).toFixed(2)
                    })
                })
                this.setState({insumosOptions, insumos: res.data.payload})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    requestGetInsumosRetirados = (idSaida) => {
        axios
        .get(this.props.backEndPoint + '/getInsumosRetirados?id_saida='+idSaida)
        .then(res => {
            if(res.data.payload){
                this.props.form.setFieldsValue({
                    keys: res.data.payload.map((row, index) => {
                        return index
                    })
                })
                this.setState({insumosRetirados: res.data.payload, dynamicFieldsRendered: true})
            }
            else{
                console.log('Nenhum registro encontrado')
            }
        })
        .catch(error => {
            console.log(error)
        })
    }

    createUpdateInsumosSaida = (request) => {
        axios.post(this.props.backEndPoint + '/createUpdateSaida', request)
        .then(res => {
            this.setState({btnSalvarLoading: false})
            this.showNotification(res.data.msg, res.data.success)
            this.props.form.resetFields()
            this.setState({
                btnSalvarLoading: false
            })
            this.props.showSaidaModalF(false)
        })
        .catch(error =>{
            this.setState({btnSalvarLoading: false})
            console.log(error)
        })
    }

    // Contabiliza quantidade de insumos que estão sendo armazenados no lançamento e atualiza insumosTemp
    contabilizaQuantidades = (idPedidoInsumo) => {
        const keys = this.props.form.getFieldValue('keys')
        var somatoriaEntradas = 0
        keys.forEach(row => {
            if(this.props.form.getFieldValue(`insumo[${row}]`) === idPedidoInsumo)
                somatoriaEntradas += parseFloat(this.props.form.getFieldValue(`quantidade[${row}]`)).toFixed(2)
        })
        var insumosTemp = cloneDeep(this.state.insumos)
        insumosTemp.forEach((insumo, index) => {
            if(insumo.idPedidoInsumo === idPedidoInsumo){
                insumosTemp[index].insumo.quantidadeArmazenar -= parseFloat(somatoriaEntradas).toFixed(2)
            }
        })
        return insumosTemp
    }

    loadInsumosInfo = (idArmazenagemInsumo, k) => {
        var insumosInfo = this.state.insumosInfo
        var content = null
        var insumosDisponiveis = cloneDeep(this.state.insumosOptions)
        insumosDisponiveis.forEach(insumo => {
            if(insumo.id === idArmazenagemInsumo){
                 content = {
                    idArmazenagemInsumo: insumo.id,
                    idAlmoxarifado: insumo.idAlmoxarifado,
                    nomeAlmoxarifado: insumo.nomeAlmoxarifado,
                    idPosicao: insumo.idPosicao,
                    nomePosicao: insumo.nomePosicao,
                    quantidadeDisponivel: parseFloat(insumo.quantidadeDisponivel).toFixed(2)
                }
                insumosInfo.splice(k, 1, content)
            }
        })
    }

    changeInsumo = (idArmazenagemInsumo, k) => {
        
        this.loadInsumosInfo(idArmazenagemInsumo, k)

        //var insumosTemp = this.contabilizaQuantidades(idPedidoInsumo)
        //this.showQuantidades(idPedidoInsumo, k, insumosTemp)
    }

    validacaoQuantidade(idPedidoInsumo, k, insumosTemp){
        var valid = true
        var quantidadeInformada = 0
        var quantidadePermitida = 0
        insumosTemp.forEach((insumo, index) => {
            if(insumo.idPedidoInsumo === idPedidoInsumo){
                if(insumosTemp[index].insumo.quantidadeArmazenar < 0){
                    quantidadeInformada = this.props.form.getFieldValue(`quantidade[${k}]`)
                    quantidadePermitida = (parseFloat(quantidadeInformada) + parseFloat(insumosTemp[index].insumo.quantidadeArmazenar)).toFixed(2)

                    var strObj = '{"quantidade['+k+']": '+quantidadePermitida+'}'
                    var obj  = JSON.parse(strObj)
                    this.props.form.setFieldsValue(obj)
                    valid = false
                }
            }
        })
        if(valid) return true
        else return quantidadePermitida
    }

    changeQuantidade = (e) => {
        /*
        var pos = e.target.id.replace('quantidade[', '').replace(']', '')

        if(e.target.value > 0){
            var idPedidoInsumo = this.props.form.getFieldValue(`insumo[${pos}]`)
            var insumosTemp = this.contabilizaQuantidades(idPedidoInsumo)
            var result = this.validacaoQuantidade(idPedidoInsumo, pos, insumosTemp)
            if(result === true){
                this.showQuantidades(idPedidoInsumo, pos, insumosTemp)
            }
            else{
                insumosTemp = this.contabilizaQuantidades(idPedidoInsumo)
                this.showQuantidades(idPedidoInsumo, pos, insumosTemp)
            }
        }
        */
    }

    handleFormSubmit = () => {
        this.setState({btnSalvarLoading: true})
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err){
                var rows = values.keys.map((row, i) => {
                    return({
                        idArmazenagemInsumos: values.insumo[i],
                        idAlmoxarifado: this.state.insumosInfo[i].idAlmoxarifado,
                        idPosicao: this.state.insumosInfo[i].idPosicao,
                        quantidade: parseFloat(values.quantidade[i]).toFixed(2)
                    })
                })
                .filter(row => {
                    return row !== null
                })

                var request = {
                    idSaida: this.props.idSaida,
                    lancamentos: rows,
                    idUsuario: this.props.session.usuario.id
                }
                this.createUpdateInsumosSaida(request)
            }
            else{
                console.log('erro no formulário')
            }
        })
    }

    addComposicaoRow = () => {
        const keys = this.props.form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)
        this.props.form.setFieldsValue({
            keys: nextKeys
        })
    }

    removeComposicaoRow = (k) => {
        var keys = this.props.form.getFieldValue('keys')
        if(keys.length === 1){
            return
        }

        keys = this.props.form.getFieldValue('keys')

        // Atualizando quantidade total
        var insumosTemp = cloneDeep(this.state.insumos) // Clonando state.insumos sem referência

        const idPedidoInsumo = this.props.form.getFieldValue(`insumo[${k}]`)
        var quantidadeAtualizada = 0
        keys.forEach(row => {
            if(row !== k && this.props.form.getFieldValue(`insumo[${row}]`) === idPedidoInsumo)
                quantidadeAtualizada += parseFloat(this.props.form.getFieldValue(`quantidade[${row}]`)).toFixed(2)
        })

        insumosTemp.forEach((insumo, index) => {
            if(insumo.idPedidoInsumo === idPedidoInsumo){
                insumosTemp[index].insumo.quantidadeArmazenar -= parseFloat(quantidadeAtualizada).toFixed(2)
            }
        })
        //this.showQuantidades(idPedidoInsumo, k, insumosTemp)

        this.props.form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        })
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.dynamicFieldsRendered && this.state.insumosOptions.length > 0){
            id = (this.state.insumosRetirados.length)

            // Carregando valores nos campos (editar)
            // Insumo
            var strObj = '{'
            var comma = ''
            
            this.state.insumosRetirados.forEach((insumo, index) => {
                comma = index === 0 ? '' : ', '
                strObj += comma+'"insumo['+index+']": '+insumo.idArmazenagemInsumo+''
                this.loadInsumosInfo(insumo.idArmazenagemInsumo, index)
            })
            strObj += '}'
            var obj  = JSON.parse(strObj)
            this.props.form.setFieldsValue(obj)


            

            // Quantidade
            strObj = '{'
            comma = ''
            this.state.insumosRetirados.forEach((insumo, index) => {
                comma = index === 0 ? '' : ', '
                strObj += comma+'"quantidade['+index+']": '+insumo.insumo.quantidadeRetirada+''
            })
            strObj += '}'
            obj  = JSON.parse(strObj)
            this.props.form.setFieldsValue(obj)
            this.setState({dynamicFieldsRendered: false})
        }

        // Evento: Modal aberto
        if(!prevProps.showSaidaModal && this.props.showSaidaModal){
            // Edit
            if(this.props.idSaida) this.requestGetInsumosRetirados(this.props.idSaida)
            this.requestGetInsumosDisponiveisParaSaida()
        }

        // Evento: Retorno da inserção por código de barras
        if(this.state.insertingInsumoData){
            this.state.insumosData.forEach(insumo => {
                var indexInsumo = insumo.index

                // Insumo
                let strObj = '{"insumo['+indexInsumo+']": '+insumo.key+'}'
                let obj  = JSON.parse(strObj)
                this.props.form.setFieldsValue(obj)

                // Quantidade
                strObj = '{"quantidade['+indexInsumo+']": '+insumo.quantidade+'}'
                obj  = JSON.parse(strObj)
                this.props.form.setFieldsValue(obj)
                
                // Infos
                var idArmazenagemInsumo = insumo.key
                let insumosInfo = this.state.insumosInfo
                let insumosDisponiveis = cloneDeep(this.state.insumosOptions)
                insumosDisponiveis.forEach(insumoDisponivel => {
                    if(insumoDisponivel.id === idArmazenagemInsumo){
                         let content = {
                            idArmazenagemInsumo: insumoDisponivel.id,
                            idAlmoxarifado: insumoDisponivel.idAlmoxarifado,
                            nomeAlmoxarifado: insumoDisponivel.nomeAlmoxarifado,
                            idPosicao: insumoDisponivel.idPosicao,
                            nomePosicao: insumoDisponivel.nomePosicao,
                            quantidadeDisponivel: parseFloat(insumoDisponivel.quantidadeDisponivel).toFixed(2)
                        }
                        insumosInfo[indexInsumo] = content
                    }
                })
                this.setState({insumosInfo})                         
            })
          
            this.setState({insertingInsumoData: false})
            this.showSaidaBarCodeF(false)
        }
        
    }

    render(){
        const { getFieldDecorator, getFieldValue } = this.props.form
        getFieldDecorator('keys', { initialValue: [] })
        const keys = getFieldValue('keys')

        const porcionamentos = keys.map(k => (
            <React.Fragment key={k}>
                <Row gutter={10} style={{marginTop: 10}}>
                    <Col span={5} id="insumo" style={{position: 'relative'}}>
                        <Form.Item style={{marginBottom: 0}}>
                            {getFieldDecorator(`insumo[${k}]`, {
                                rules: [{
                                    required: true, message: "Informe o insumo"
                                }],
                            })(
                                <Select
                                    style={{ width: '100%' }}
                                    allowClear={true}
                                    onChange={(value) => this.changeInsumo(value, k)}
                                    getPopupContainer={() => document.getElementById('colSaida')}
                                >
                                    {
                                        this.state.insumosOptions.map((option) => {
                                            return (<Select.Option key={option.id} value={option.id}>{option.id} - {option.nomeInsumo}</Select.Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={5} className="bold">
                        {this.state.insumosInfo[k] ? this.state.insumosInfo[k].nomeAlmoxarifado : null}
                    </Col>
                    <Col span={5} className="bold">
                        {this.state.insumosInfo[k] ? this.state.insumosInfo[k].nomePosicao : null}
                    </Col>
                    <Col span={5} className="bold">
                        {this.state.insumosInfo[k] ? this.state.insumosInfo[k].quantidadeDisponivel : null}
                    </Col>
                    
                        <Col span={4}>
                            <Form.Item style={{marginBottom: 0}}>
                                {getFieldDecorator(`quantidade[${k}]`, {
                                    rules: [{
                                        required: true, message: "Informe a quantidade"
                                    }],
                                })(
                                    <Input
                                        style={{ width: '75%', marginRight: 8 }}
                                        placeholder="Qtd"
                                        onBlur={this.changeQuantidade}

                                    />
                                )}
                                {keys.length > 1 ? (
                                    <Icon
                                        className="dynamic-delete-button"
                                        type="minus-circle-o"
                                        disabled={keys.length === 1}
                                        onClick={() => this.removeComposicaoRow(k)}
                                    />
                                ) : null}
                            </Form.Item>
                        </Col>
                    
                    
                </Row>
            </React.Fragment>
        ))


        return(
            <React.Fragment>
                <Modal
                    title="Saída de Insumos"
                    visible={this.props.showSaidaModal}
                    onCancel={() => this.props.showSaidaModalF(false)}
                    width={1300}
                    footer={[
                        <Button key="barcode" type="link" title="Saída por Código de Barras" onClick={() => this.showSaidaBarCodeF(true)} style={{marginLeft: '1px'}}><Icon type="barcode" /> Utilizar Código de Barras</Button>,
                        <Button key="back" onClick={() => this.props.showSaidaModalF(false)}><Icon type="close" /> Fechar</Button>,
                        <Button key="submit" type="primary" loading={this.state.btnSalvarLoading} onClick={() => this.handleFormSubmit()}><Icon type="save" /> Salvar</Button>
                    ]}
                >
                    <Row>
                        <Col span={24} id="colSaida" style={{position: 'relative'}}>
                            <Form layout="vertical">
                                {
                                    porcionamentos.length > 0 ?
                                    <Row className="bold" style={{marginBottom: 10}}>
                                        <Col span={5}>Insumo</Col>
                                        <Col span={5}>Almoxarifado</Col>
                                        <Col span={5}>Posição</Col>
                                        <Col span={5}>Quantidade Disponível</Col>
                                        <Col span={4}>Quantidade</Col>
                                    </Row>
                                    :null
                                }
                                
                                {porcionamentos}
                                <Row>
                                    <Col span={24}>
                                        <Button key="primary" title="Novo Porcionamento" onClick={this.addComposicaoRow}><Icon type="plus" /></Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Modal>
                <Row>
                    <SaidaBarCode
                        insertSaidaInsumoF={this.insertSaidaInsumoF}
                        returnInsumosInsertedF={this.returnInsumosInsertedF}
                        showSaidaBarCodeF={this.showSaidaBarCodeF}
                        showSaidaBarCode={this.state.showSaidaBarCode}/>
                </Row>
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
        setPageTitle: (pageTitle) => { dispatch({ type: 'SET_PAGETITLE', pageTitle }) }
    }
}

export default connect(MapStateToProps, mapDispatchToProps)(Form.create()(SaidaInsumos))